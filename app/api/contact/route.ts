import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Contact form submission schema
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String },
  message: { type: String, required: true },
  inquiryType: { 
    type: String, 
    enum: ['demo', 'pricing', 'technical', 'partnership', 'other'],
    required: true 
  },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' }
});

// Create model if it doesn't exist
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { name, email, company, message, inquiryType } = body;
    
    // Validate required fields
    if (!name || !email || !message || !inquiryType) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create contact submission
    const contactSubmission = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || '',
      message: message.trim(),
      inquiryType,
    });

    // Save to database
    const savedSubmission = await contactSubmission.save();
    
    // TODO: Send email notification to admin
    // TODO: Send auto-reply to user
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: savedSubmission._id,
    });
    
  } catch (error: any) {
    console.error('Error in POST /api/contact:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get contact submissions (for admin use)
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    const query: any = {};
    if (status && ['new', 'contacted', 'closed'].includes(status)) {
      query.status = status;
    }
    
    // Get submissions
    const submissions = await Contact
      .find(query)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      success: true,
      submissions,
      total: await Contact.countDocuments(query)
    });
    
  } catch (error: any) {
    console.error('Error in GET /api/contact:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}