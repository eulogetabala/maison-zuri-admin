const { Storage } = require('@google-cloud/storage');
const path = require('path');

async function configureCors() {
  const storage = new Storage({
    keyFilename: path.join(__dirname, 'burger-house-4a1fd-firebase-adminsdk-sp69x-e196726d1b.json'),
  });

  try {
    console.log('🔍 Recherche des buckets disponibles...');
    const [buckets] = await storage.getBuckets();
    
    if (buckets.length === 0) {
      console.error('❌ Aucun bucket trouvé dans ce projet.');
      return;
    }

    for (const bucket of buckets) {
      console.log(`⏳ Configuration du CORS pour le bucket : ${bucket.name}...`);
      await bucket.setCorsConfiguration([
        {
          maxAgeSeconds: 3600,
          method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
          origin: ['*'],
          responseHeader: ['Content-Type', 'Authorization'],
        },
      ]);
      console.log(`✅ Succès pour : ${bucket.name}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
  }
}

configureCors();
