import { NextRequest, NextResponse } from 'next/server';
import { getSessionManager, initializeGlobalSession } from '@/lib/session-manager';

// GET /api/session - Get current session info
export async function GET() {
  try {
    const sessionManager = getSessionManager();
    const sessionInfo = await sessionManager.getSessionInfo();
    
    return NextResponse.json({
      success: true,
      data: sessionInfo
    });
  } catch (error: any) {
    console.error('Failed to get session info:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/session - Initialize or manage session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;
    
    switch (action) {
      case 'initialize':
        await initializeGlobalSession(config);
        return NextResponse.json({
          success: true,
          message: 'Session initialized successfully'
        });
        
      case 'clear':
        const sessionManager = getSessionManager();
        await sessionManager.clearCurrentSession();
        return NextResponse.json({
          success: true,
          message: 'Session documents cleared successfully'
        });
        
      case 'info':
        const sessionManager2 = getSessionManager();
        const sessionInfo = await sessionManager2.getSessionInfo();
        return NextResponse.json({
          success: true,
          data: sessionInfo
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: initialize, clear, or info'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Session management error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/session - Clear all session documents
export async function DELETE() {
  try {
    const sessionManager = getSessionManager();
    await sessionManager.clearCurrentSession();
    
    return NextResponse.json({
      success: true,
      message: 'All session documents cleared successfully'
    });
  } catch (error: any) {
    console.error('Failed to clear session:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}