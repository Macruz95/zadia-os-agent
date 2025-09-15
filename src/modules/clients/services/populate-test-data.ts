/**
 * Script to populate database with test data
 * This can be called from a Next.js API route or page
 */

import { ClientsService } from './entities/clients-entity.service';

export async function populateTestData() {
  try {
    console.log('🚀 Starting test data population...');

    // Create a test client
    const clientId = await ClientsService.createTestClient();
    console.log('✅ Test client created:', clientId);

    console.log('🎉 Test data population completed successfully!');
    console.log('📋 Test Client ID:', clientId);
    console.log('💡 You can now view this client in the application');

    return { success: true, clientId };

  } catch (error) {
    console.error('❌ Error populating test data:', error);
    return { success: false, error: String(error) };
  }
}