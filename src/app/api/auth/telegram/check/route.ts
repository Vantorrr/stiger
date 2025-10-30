import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { telegramId } = await req.json();
    
    if (!telegramId) {
      return NextResponse.json({ authorized: false });
    }
    
    // Проверяем есть ли пользователь в памяти
    global.telegramUsers = global.telegramUsers || new Map();
    const userData = global.telegramUsers.get(parseInt(telegramId));
    
    if (userData) {
      return NextResponse.json({ 
        authorized: true, 
        user: userData 
      });
    }
    
    return NextResponse.json({ authorized: false });
  } catch (error) {
    console.error("Check auth error:", error);
    return NextResponse.json({ authorized: false });
  }
}





