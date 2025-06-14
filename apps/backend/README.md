# Grocery Backend API

This backend API connects to a Neon PostgreSQL database using Drizzle ORM.

## Database Setup

### 1. Environment Configuration

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Neon database credentials:
   ```
   DATABASE_URL="postgresql://username:password@ep-your-endpoint.region.aws.neon.tech/neondb?sslmode=require"
   ```

### 2. Database Migration

After setting up your environment variables, run the following commands to set up your database:

1. Generate migration files:

   ```bash
   npm run db:generate
   ```

2. Push the schema to your database:

   ```bash
   npm run db:push
   ```

   Or alternatively, run migrations:

   ```bash
   npm run db:migrate
   ```

### 3. Database Studio (Optional)

To view and manage your database with a GUI:

```bash
npm run db:studio
```

## API Endpoints

### GET /api/groceries

- Returns all grocery items
- Query parameter `id` to get a specific item

### POST /api/groceries

- Toggles the `inCart` status of a grocery item
- Body: `{ "id": "1" }`

### PUT /api/groceries

- Creates a new grocery item
- Body: `{ "name": "Item Name" }`

## Database Schema

The `grocery_lists` table has the following structure:

- `id`: Serial primary key
- `name`: VARCHAR(255) - Name of the grocery item
- `in_cart`: BOOLEAN - Whether the item is in the cart (default: false)

## Development

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/groceries`
