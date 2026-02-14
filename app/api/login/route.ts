import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user by username
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, username, password, type, created_at')
            .eq('username', username)
            .single();

        if (findError || !user) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                type: user.type,
            },
            JWT_SECRET,
            {
                expiresIn: '7d', // Token expires in 7 days
            }
        );

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    type: user.type,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// Optional: GET endpoint to validate token (can be used to check if token is still valid)
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        return NextResponse.json(
            {
                message: 'Token is valid',
                user: {
                    id: decoded.id,
                    username: decoded.username,
                    type: decoded.type,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Token validation error:', error);
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
        );
    }
}