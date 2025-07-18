const { Client, Databases, ID, Query } = require("node-appwrite");

module.exports = async function (req, res) {
  const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // required inside functions

  const database = new Databases(client);

  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://cinestream-three.vercel.app',
    'http://localhost:3000',
  ];

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.send('', 200, corsHeaders);
  }

  try {
    if (req.method === 'POST') {
      const { searchTerm, movie } = JSON.parse(req.body);

      const result = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
        [Query.equal('searchTerm', searchTerm)]
      );

      if (result.documents.length > 0) {
        const doc = result.documents[0];
        await database.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
          doc.$id,
          {
            count: doc.count + 1,
          }
        );
      } else {
        await database.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
          ID.unique(),
          {
            searchTerm,
            count: 1,
            movie_id: movie.id,
            poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            title: movie.title,
          }
        );
      }

      return res.json({ message: 'updated' }, 200, corsHeaders);
    }

    if (req.method === 'GET') {
      const result = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
        [Query.limit(5), Query.orderDesc("count")]
      );

      return res.json({ movies: result.documents }, 200, corsHeaders);
    }

    return res.json({ error: 'Unsupported Method' }, 405, corsHeaders);
  } catch (error) {
    console.error(error);
    return res.json({ error: 'Internal Server Error' }, 500, corsHeaders);
  }
};
