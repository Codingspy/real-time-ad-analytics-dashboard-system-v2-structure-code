const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Backend Environment...');
console.log('====================================');

const setupEnv = () => {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'env.example');
  
  // Check if .env exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    return true;
  }
  
  // Check if env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ env.example file not found');
    return false;
  }
  
  try {
    // Copy env.example to .env
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created from env.example');
    return true;
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    return false;
  }
};

const checkDependencies = () => {
  const packagePath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  node_modules not found - run npm install');
    return false;
  }
  
  console.log('✅ Dependencies check passed');
  return true;
};

const checkDockerServices = () => {
  console.log('\n📋 Checking Docker services...');
  console.log('Make sure these services are running:');
  console.log('- MongoDB: mongodb://localhost:27017');
  console.log('- Redis: redis://localhost:6379');
  console.log('- Elasticsearch: http://localhost:9200');
  console.log('- Kibana: http://localhost:5601');
};

const main = () => {
  console.log('Step 1: Setting up .env file...');
  const envSetup = setupEnv();
  
  console.log('\nStep 2: Checking dependencies...');
  const depsCheck = checkDependencies();
  
  console.log('\nStep 3: Checking Docker services...');
  checkDockerServices();
  
  console.log('\n🎯 Setup Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Environment: ${envSetup ? '✅ Ready' : '❌ Needs setup'}`);
  console.log(`Dependencies: ${depsCheck ? '✅ Ready' : '❌ Needs npm install'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (envSetup && depsCheck) {
    console.log('\n🚀 Ready to start backend!');
    console.log('Run: npm run dev');
    console.log('\n📧 Email Status:');
    console.log('- Development mode: Emails will be logged to console');
    console.log('- No external email service needed for development');
    console.log('\n🔐 Login Credentials:');
    console.log('- admin@adanalytics.com / AdAnalytics2024!Admin');
    console.log('- manager@adanalytics.com / AdAnalytics2024!Manager');
    console.log('- analyst@adanalytics.com / AdAnalytics2024!Analyst');
    console.log('- viewer@adanalytics.com / AdAnalytics2024!Viewer');
  } else {
    console.log('\n⚠️  Please fix the issues above before starting the backend');
  }
};

main();
