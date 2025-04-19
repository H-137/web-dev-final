import clientPromise from '../../db/mongodb';
import { NextResponse } from 'next/server';

// GET: Fetch all locations
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('Study-Proj');
    const collection = db.collection('locations');
    const locations = await collection.find({}).toArray();

    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

// POST: Add a new location
export async function POST(request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db('Study-Proj');
    const collection = db.collection('locations');

    const result = await collection.insertOne(data);

    return NextResponse.json({ message: 'Location added', insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to insert location' }, { status: 500 });
  }
}
