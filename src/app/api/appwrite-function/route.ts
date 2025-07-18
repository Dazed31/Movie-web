import { NextRequest, NextResponse } from 'next/server'
import { Client, Query, ID, Databases } from 'appwrite'

const allowedOrigins = [
  'http://localhost:3000',
  'https://cinestream-three.vercel.app',
]

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  return new NextResponse(null, { status: 200, headers })
}

export async function POST(req: NextRequest) {
  const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)


  const db = new Databases(client)

  const origin = req.headers.get('origin') || ''
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
  }

  try {
    const { searchTerm, movie } = await req.json()

    const docs = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      [Query.equal('searchTerm', searchTerm)]
    )

    if (docs.documents.length > 0) {
      const doc = docs.documents[0]
      await db.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        doc.$id,
        { count: doc.count + 1 }
      )
    } else {
      await db.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        ID.unique(),
        {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          title: movie.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      )
    }

    return NextResponse.json({ message: 'updated' }, { status: 200, headers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'server error' }, { status: 500, headers })
  }
}

export async function GET() {
  const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  

  const db = new Databases(client)

  try {
    const result = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      [Query.orderDesc('count'), Query.limit(5)]
    )

    return NextResponse.json({ movies: result.documents }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load trending' }, { status: 500 })
  }
}
