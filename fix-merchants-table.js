const { pool } = require('./config/database');

async function fixMerchantsTable() {
  console.log('🔧 Fixing merchants table schema...');
  
  try {
    // Check if status column exists
    console.log('Checking if status column exists...');
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'merchants' 
        AND COLUMN_NAME = 'status'
    `);
    
    if (columns.length === 0) {
      console.log('❌ Status column missing, adding it...');
      
      // Add status column
      await pool.execute(`
        ALTER TABLE merchants 
        ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'
      `);
      
      console.log('✅ Status column added successfully');
      
      // Update existing merchants to be active
      const [result] = await pool.execute(`
        UPDATE merchants SET status = 'active' WHERE status IS NULL
      `);
      
      console.log(`✅ Updated ${result.affectedRows} merchants to active status`);
    } else {
      console.log('✅ Status column already exists');
    }
    
    // Verify the fix
    console.log('Verifying merchants table structure...');
    const [tableInfo] = await pool.execute(`
      DESCRIBE merchants
    `);
    
    console.log('✅ Current merchants table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
    // Test query that was failing
    console.log('Testing the problematic query...');
    const [testResult] = await pool.execute(`
      SELECT merchant_id, store_name, owner_name, email, status 
      FROM merchants 
      WHERE status = 'active' 
      LIMIT 1
    `);
    
    console.log(`✅ Query test successful - found ${testResult.length} active merchants`);
    
    return { success: true, message: 'Merchants table fixed successfully' };
    
  } catch (error) {
    console.error('❌ Error fixing merchants table:', error.message);
    console.error('Error details:', error);
    return { success: false, error: error.message };
  }
}

// Export for use in other files
module.exports = fixMerchantsTable;

// Run directly if called as script
if (require.main === module) {
  fixMerchantsTable()
    .then(result => {
      console.log('\n🏁 Fix completed:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}