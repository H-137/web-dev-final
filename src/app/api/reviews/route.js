import clientPromise from '../../db/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('Study-Proj');
    const reviews = await db.collection('reviews').find({}).toArray();
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('Study-Proj');
    const result = await db.collection('reviews').insertMany(body);
    return NextResponse.json({ message: 'Reviews added', insertedCount: result.insertedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to insert reviews' }, { status: 500 });
  }
}
