import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { categories, channels } from './db/schema';
import { eq, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('Fetching all categories...');
  const allCats = await db.select().from(categories);
  console.log(allCats);
  
  for (const cat of allCats) {
    if (cat.name.startsWith('▼ ')) {
      const newName = cat.name.replace('▼ ', '').trim();
      console.log(`Renaming ${cat.name} back to ${newName}...`);
      try {
        await db.update(categories)
          .set({ name: newName })
          .where(eq(categories.id, cat.id));
      } catch (e) {
        // If unique constraint error (e.g. duplicate), delete the duplicate if it has no channels!
        console.log(`Failed to rename ${cat.name}, deleting duplicate instead!`);
        await db.delete(categories).where(eq(categories.id, cat.id));
      }
    }
  }
  
  const finalCats = await db.select().from(categories);
  console.log('Final categories:', finalCats);
  process.exit(0);
}
main();
