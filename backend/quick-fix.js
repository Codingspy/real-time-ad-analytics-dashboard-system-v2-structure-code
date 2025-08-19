const fs = require('fs');
const path = require('path');

console.log('🔧 Quick Backend Fix Script');
console.log('===========================');

// Fix 1: Ensure .env file exists
console.log('\n1. Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file missing - creating it...');
  const envExamplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from env.example');
  } else {
    console.log('❌ env.example file not found');
  }
} else {
  console.log('✅ .env file exists');
}

// Fix 2: Check for common nodemailer issues
console.log('\n2. Checking nodemailer configuration...');
const authPath = path.join(__dirname, 'src', 'routes', 'auth.js');
if (fs.existsSync(authPath)) {
  let authContent = fs.readFileSync(authPath, 'utf8');
  
  // Fix createTransporter typo
  if (authContent.includes('createTransporter')) {
    console.log('❌ Found createTransporter typo - fixing...');
    authContent = authContent.replace(/createTransporter/g, 'createTransport');
    fs.writeFileSync(authPath, authContent);
    console.log('✅ Fixed createTransporter typo');
  } else {
    console.log('✅ Nodemailer configuration looks correct');
  }
} else {
  console.log('❌ auth.js file not found');
}

// Fix 3: Check for MongoDB connection issues
console.log('\n3. Checking MongoDB configuration...');
const dbPath = path.join(__dirname, 'src', 'config', 'database.js');
if (fs.existsSync(dbPath)) {
  let dbContent = fs.readFileSync(dbPath, 'utf8');
  
  // Fix deprecated MongoDB options
  if (dbContent.includes('bufferMaxEntries') || dbContent.includes('useNewUrlParser') || dbContent.includes('useUnifiedTopology')) {
    console.log('❌ Found deprecated MongoDB options - fixing...');
    dbContent = dbContent.replace(/,\s*bufferMaxEntries:\s*0/g, '');
    dbContent = dbContent.replace(/,\s*useNewUrlParser:\s*true/g, '');
    dbContent = dbContent.replace(/,\s*useUnifiedTopology:\s*true/g, '');
    fs.writeFileSync(dbPath, dbContent);
    console.log('✅ Fixed deprecated MongoDB options');
  } else {
    console.log('✅ MongoDB configuration looks correct');
  }
} else {
  console.log('❌ database.js file not found');
}

// Fix 4: Check for Elasticsearch connection issues
console.log('\n4. Checking Elasticsearch configuration...');
const serverPath = path.join(__dirname, 'src', 'server.js');
if (fs.existsSync(serverPath)) {
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Fix Elasticsearch version access issue
  if (serverContent.includes('esInfo.body.version.number')) {
    console.log('❌ Found unsafe Elasticsearch version access - fixing...');
    serverContent = serverContent.replace(
      /\/\/ Test Elasticsearch connection\s+const esInfo = await elasticsearchClient\.info\(\);\s+logger\.info\('Connected to Elasticsearch', \{ version: esInfo\.body\.version\.number \}\);/g,
      `// Test Elasticsearch connection
    try {
      const esInfo = await elasticsearchClient.info();
      if (esInfo && esInfo.body && esInfo.body.version) {
        logger.info('Connected to Elasticsearch', { version: esInfo.body.version.number });
      } else {
        logger.info('Connected to Elasticsearch (version info not available)');
      }
    } catch (esError) {
      logger.warn('Elasticsearch connection failed, continuing without it:', esError.message);
      logger.info('Server will run without Elasticsearch functionality');
    }`
    );
    fs.writeFileSync(serverPath, serverContent);
    console.log('✅ Fixed Elasticsearch version access');
  } else {
    console.log('✅ Elasticsearch configuration looks correct');
  }
} else {
  console.log('❌ server.js file not found');
}

// Fix 5: Check package.json for dependencies
console.log('\n5. Checking dependencies...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = ['nodemailer', 'express', 'mongoose', 'bcryptjs'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} is installed`);
    } else {
      console.log(`❌ ${dep} is missing`);
    }
  });
} else {
  console.log('❌ package.json not found');
}

// Fix 6: Create logs directory if it doesn't exist
console.log('\n6. Checking logs directory...');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('❌ logs directory missing - creating it...');
  fs.mkdirSync(logsDir);
  console.log('✅ logs directory created');
} else {
  console.log('✅ logs directory exists');
}

console.log('\n🎯 Quick fix completed!');
console.log('Now try running: npm run dev');
