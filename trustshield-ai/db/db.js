const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'trustshield.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'SELLER', 'ADMIN')),
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS SellerProfile (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      storeName TEXT NOT NULL,
      trustScore REAL DEFAULT 85.0,
      status TEXT DEFAULT 'ACTIVE',
      approvedListingsCount INTEGER DEFAULT 0,
      totalOrdersCount INTEGER DEFAULT 0,
      returnCount INTEGER DEFAULT 0,
      violationsCount INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      sellerId TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      msrp REAL NOT NULL,
      imageUrl TEXT NOT NULL,
      brandAuthDoc TEXT,
      status TEXT NOT NULL CHECK(status IN ('DRAFT', 'PENDING_APPROVAL', 'AI_REVIEW', 'UNDER_ADMIN_REVIEW', 'APPROVED', 'BLOCKED', 'REJECTED')),
      authenticityScore REAL,
      counterfeitProbability REAL,
      riskLevel TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (sellerId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS ProductApproval (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      sellerId TEXT NOT NULL,
      status TEXT NOT NULL,
      aiAssessmentId TEXT,
      adminDecision TEXT,
      adminReason TEXT,
      adminId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES Product(id)
    );

    CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      sellerId TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      paymentMethod TEXT NOT NULL CHECK(paymentMethod IN ('UPI', 'CARD', 'COD')),
      status TEXT NOT NULL DEFAULT 'PLACED',
      riskScore REAL,
      riskLevel TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (customerId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS OrderItem (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES "Order"(id),
      FOREIGN KEY (productId) REFERENCES Product(id)
    );

    CREATE TABLE IF NOT EXISTS ReturnRequest (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      customerId TEXT NOT NULL,
      reason TEXT NOT NULL,
      description TEXT NOT NULL,
      evidenceUrl TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      riskScore REAL,
      explanation TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES "Order"(id)
    );

    CREATE TABLE IF NOT EXISTS Review (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      customerId TEXT NOT NULL,
      orderId TEXT NOT NULL,
      rating INTEGER NOT NULL,
      reviewText TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      fakeProbability REAL,
      riskLevel TEXT,
      explanation TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES Product(id),
      FOREIGN KEY (customerId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS RiskAssessment (
      id TEXT PRIMARY KEY,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      riskScore REAL NOT NULL,
      riskLevel TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      explanation TEXT NOT NULL,
      modelVersion TEXT NOT NULL,
      latency INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AuthenticityAssessment (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      authenticityScore REAL NOT NULL,
      counterfeitProbability REAL NOT NULL,
      riskLevel TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      explanation TEXT NOT NULL,
      modelVersion TEXT NOT NULL,
      latency INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES Product(id)
    );

    CREATE TABLE IF NOT EXISTS ReviewAssessment (
      id TEXT PRIMARY KEY,
      reviewId TEXT NOT NULL,
      fakeProbability REAL NOT NULL,
      riskLevel TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      explanation TEXT NOT NULL,
      modelVersion TEXT NOT NULL,
      latency INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (reviewId) REFERENCES Review(id)
    );

    CREATE TABLE IF NOT EXISTS FraudCase (
      id TEXT PRIMARY KEY,
      caseNumber TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      entityId TEXT NOT NULL,
      riskScore REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      assignedTo TEXT,
      agent TEXT NOT NULL,
      explanation TEXT NOT NULL,
      overrideReason TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AgentExecution (
      id TEXT PRIMARY KEY,
      agent TEXT NOT NULL,
      caseId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      modelVersion TEXT NOT NULL,
      result TEXT NOT NULL,
      confidence REAL,
      latency INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      actor TEXT NOT NULL,
      role TEXT NOT NULL,
      entityType TEXT DEFAULT 'UNKNOWN',
      entity TEXT NOT NULL,
      agent TEXT,
      modelVersion TEXT,
      action TEXT NOT NULL,
      decision TEXT NOT NULL,
      riskScore REAL,
      explanation TEXT,
      policyName TEXT,
      policyVersion TEXT,
      ruleTriggered TEXT,
      humanOverride INTEGER DEFAULT 0,
      overrideReason TEXT
    );

    CREATE TABLE IF NOT EXISTS ModelVersion (
      id TEXT PRIMARY KEY,
      agentName TEXT NOT NULL,
      version TEXT NOT NULL,
      datasetUsed TEXT NOT NULL,
      accuracy REAL,
      status TEXT NOT NULL,
      deployedAt TEXT NOT NULL
    );
  `);

  // Safe migrations — add new AuditLog columns to existing databases
  // SQLite ALTER TABLE ADD COLUMN is safe to call even if the column already exists via try/catch
  const auditMigrations = [
    `ALTER TABLE AuditLog ADD COLUMN entityType TEXT DEFAULT 'UNKNOWN'`,
    `ALTER TABLE AuditLog ADD COLUMN policyName TEXT`,
    `ALTER TABLE AuditLog ADD COLUMN policyVersion TEXT`,
    `ALTER TABLE AuditLog ADD COLUMN ruleTriggered TEXT`,
  ];
  for (const sql of auditMigrations) {
    try { db.prepare(sql).run(); } catch (_) { /* column already exists — safe to ignore */ }
  }

  // Seed Demo Accounts if not present
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM User').get();
  if (userCheck.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO User (id, email, password, name, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    insertUser.run('usr-customer-1', 'customer@trustshield.demo', 'customer123', 'Aarav Sharma (Customer)', 'CUSTOMER', now);
    insertUser.run('usr-seller-1', 'seller@trustshield.demo', 'seller123', 'Apex Electronics (Seller)', 'SELLER', now);
    insertUser.run('usr-admin-1', 'admin@trustshield.demo', 'admin123', 'Vikram Mehta (Trust & Safety Admin)', 'ADMIN', now);

    // Create Seller Profile
    db.prepare(`
      INSERT INTO SellerProfile (id, userId, storeName, trustScore, status, approvedListingsCount, totalOrdersCount, returnCount, violationsCount, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('sp-seller-1', 'usr-seller-1', 'Apex Electronics & Audio', 94.5, 'ACTIVE', 2, 14, 1, 0, now);

    // Seed Sample Products
    const insertProd = db.prepare(`
      INSERT INTO Product (id, sellerId, name, brand, description, category, price, msrp, imageUrl, brandAuthDoc, status, authenticityScore, counterfeitProbability, riskLevel, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProd.run(
      'prod-boat-141',
      'usr-seller-1',
      'boAt Airdopes 141 Bluetooth Earbuds',
      'boAt',
      'True wireless earbuds with 42H play time, IPX4 water resistance, and ENx Technology.',
      'Electronics',
      1299.0,
      4490.0,
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
      'AUTH-BOAT-8921.pdf',
      'APPROVED',
      97.5,
      2.5,
      'LOW',
      now,
      now
    );

    insertProd.run(
      'prod-noise-watch',
      'usr-seller-1',
      'Noise ColorFit Pro 4 Smartwatch',
      'Noise',
      '1.72" display smartwatch with Bluetooth calling, 100 sports modes and health tracking.',
      'Wearables',
      1999.0,
      4999.0,
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'AUTH-NOISE-3341.pdf',
      'APPROVED',
      95.0,
      5.0,
      'LOW',
      now,
      now
    );

    insertProd.run(
      'prod-airpods-fake',
      'usr-seller-1',
      'Apple AirPods Pro (2nd Gen) - Premium White',
      'Apple',
      'Unboxed genuine wireless noise cancelling earphones with MagSafe charging case.',
      'Electronics',
      2999.0,
      24900.0,
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
      null,
      'UNDER_ADMIN_REVIEW',
      24.0,
      96.0,
      'HIGH',
      now,
      now
    );

    // Seed Model Versions
    const insertMV = db.prepare(`
      INSERT INTO ModelVersion (id, agentName, version, datasetUsed, accuracy, status, deployedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertMV.run('mv-risk-v2', 'Risk Scoring Agent', 'v2.4.0', 'IEEE-CIS & Kaggle E-Commerce Fraud Dataset', 94.8, 'ACTIVE', now);
    insertMV.run('mv-auth-v1', 'Authenticity Agent', 'v1.8.2', 'Counterfeit Product & INNV Luxury Fashion Dataset', 96.4, 'ACTIVE', now);
    insertMV.run('mv-rev-v3', 'Review Moderation Agent', 'v3.1.0', 'Amazon Fake Reviews & OpSpam Corpus', 92.1, 'ACTIVE', now);

    // Seed Initial Fraud Case
    db.prepare(`
      INSERT INTO FraudCase (id, caseNumber, type, entityId, riskScore, status, assignedTo, agent, explanation, overrideReason, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'fc-784511',
      'CASE-784511',
      'LISTING_COUNTERFEIT',
      'prod-airpods-fake',
      96.0,
      'UNDER_REVIEW',
      'Vikram Mehta',
      'Authenticity Agent',
      'Listing price (₹2,999) is 88% below brand MSRP (₹24,900); Vision logo match is 34%; Seller lacks registered brand authorization document.',
      null,
      now
    );

    // Seed Initial Audit Logs
    const insertAudit = db.prepare(`
      INSERT INTO AuditLog (id, timestamp, actor, role, entity, agent, modelVersion, action, decision, riskScore, explanation, policy, humanOverride, overrideReason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run(
      'audit-init-1',
      now,
      'SYSTEM',
      'SYSTEM',
      'prod-airpods-fake',
      'Authenticity Agent',
      'v1.8.2',
      'AUTHENTICITY_ANALYSIS',
      'UNDER_ADMIN_REVIEW',
      96.0,
      'Price 88% below MSRP. Logo geometry variance detected.',
      'Policy: High Counterfeit Probability (>80%) requires Mandatory Admin Review',
      0,
      null
    );
  }
}

initDb();

module.exports = db;
