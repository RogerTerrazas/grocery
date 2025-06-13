import { NextResponse } from 'next/server';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

const mockTodos: Todo[] = [
  {
    id: 1,
    title: "Learn Next.js",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Build a Todo App",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Deploy to Production",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(mockTodos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTodo: Todo = {
      id: mockTodos.length + 1,
      title: body.title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    mockTodos.push(newTodo);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    const todoIndex = mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return NextResponse.json(
        { message: 'Todo not found' },
        { status: 404 }
      );
    }

    mockTodos[todoIndex] = {
      ...mockTodos[todoIndex],
      ...updates,
    };

    return NextResponse.json(mockTodos[todoIndex]);
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    const todoIndex = mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return NextResponse.json(
        { message: 'Todo not found' },
        { status: 404 }
      );
    }

    mockTodos.splice(todoIndex, 1);
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid request' },
      { status: 400 }
    );
  }
} 