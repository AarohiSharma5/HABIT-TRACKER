/**
 * DATA PERSISTENCE VERIFICATION SCRIPT
 * 
 * This file demonstrates how the persistence mechanism works
 * Run this in the browser console to verify data flow
 */

// Test 1: Verify habits are loaded from MongoDB
async function testPersistence() {
    console.log('🧪 Testing Data Persistence...\n');
    
    // Test 1: Check if habits variable is populated from MongoDB
    console.log('Test 1: Loading habits from MongoDB');
    const response = await fetch('/api/habits');
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
        console.log('✅ Successfully fetched', data.count, 'habits from MongoDB');
        console.log('Sample habit structure:', data.data[0]);
        console.log('\nPersistence fields:');
        if (data.data[0]) {
            console.log('  - _id:', data.data[0]._id, '(MongoDB document ID)');
            console.log('  - streak:', data.data[0].streak, '(persisted in DB)');
            console.log('  - lastCompleted:', data.data[0].lastCompleted, '(persisted)');
            console.log('  - completionHistory length:', data.data[0].completionHistory?.length || 0);
        }
    } else {
        console.log('❌ Failed to load habits');
    }
    
    // Test 2: Verify completionHistory is the source of truth
    console.log('\n\nTest 2: Checking completionHistory (Source of Truth)');
    if (data.data.length > 0) {
        const habit = data.data[0];
        console.log('Habit:', habit.name);
        console.log('Current Streak:', habit.streak, 'days');
        console.log('Completion History:');
        habit.completionHistory?.forEach((entry, i) => {
            console.log(`  ${i + 1}. ${new Date(entry.date).toDateString()}`);
        });
        console.log('💡 This history persists in MongoDB forever!');
    }
    
    // Test 3: Verify data survives page reload
    console.log('\n\nTest 3: Page Reload Test');
    console.log('📝 Instructions:');
    console.log('1. Note the current habit count:', data.count);
    console.log('2. Press F5 or Ctrl+R to reload the page');
    console.log('3. Run this function again: testPersistence()');
    console.log('4. Verify the count is the same');
    console.log('✅ If count matches, persistence is working!');
    
    console.log('\n\n✨ Persistence Verification Complete!');
}

// Test 4: Create a habit and verify it persists
async function testCreateHabit() {
    console.log('🧪 Testing Habit Creation Persistence...\n');
    
    const testHabit = {
        name: 'Test Habit - ' + Date.now(),
        description: 'Testing persistence'
    };
    
    console.log('Creating habit:', testHabit.name);
    
    const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testHabit)
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ Habit created successfully!');
        console.log('MongoDB assigned ID:', data.data._id);
        console.log('\n📝 Now reload the page (F5) and check if this habit still exists');
        console.log('You can search for:', testHabit.name);
    } else {
        console.log('❌ Failed to create habit');
    }
}

// Test 5: Verify streak persistence
async function testStreakPersistence() {
    console.log('🧪 Testing Streak Persistence...\n');
    
    const response = await fetch('/api/habits');
    const data = await response.json();
    
    if (data.data.length > 0) {
        const habit = data.data[0];
        const oldStreak = habit.streak;
        
        console.log('Habit:', habit.name);
        console.log('Current Streak:', oldStreak);
        console.log('\nMarking as completed for today...');
        
        const updateResponse = await fetch(`/api/habits/${habit._id}/today`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true })
        });
        
        const updateData = await updateResponse.json();
        
        if (updateData.success) {
            console.log('✅ Habit marked complete!');
            console.log('New Streak:', updateData.data.streak);
            console.log('\n📝 Now reload the page and verify:');
            console.log('1. The streak value persists');
            console.log('2. The checkbox remains checked');
            console.log('3. The completionHistory contains today');
            console.log('\nThis proves data is saved to MongoDB!');
        }
    } else {
        console.log('❌ No habits found. Create one first!');
    }
}

// Instructions
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         HABIT TRACKER PERSISTENCE VERIFICATION                ║
╚═══════════════════════════════════════════════════════════════╝

Run these commands in the browser console to verify persistence:

1️⃣  testPersistence()      - Check if habits load from MongoDB
2️⃣  testCreateHabit()      - Create a habit and verify it persists
3️⃣  testStreakPersistence() - Complete a habit and verify streak persists

Each test will guide you through verifying that data persists
across page reloads by using MongoDB as the storage backend.

`);
