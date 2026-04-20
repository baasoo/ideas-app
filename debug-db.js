const { Pool } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function debugDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("Connecting to database...");

    // Check database connection
    const result = await pool.query("SELECT NOW()");
    console.log("✓ Database connected:", result.rows[0]);

    // List all tables
    console.log("\n--- Tables ---");
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("Tables:", tablesResult.rows.map((r) => r.table_name));

    // Check users table
    console.log("\n--- Users Table ---");
    const usersResult = await pool.query("SELECT COUNT(*) as count FROM users");
    console.log(`Total users: ${usersResult.rows[0].count}`);
    const usersData = await pool.query("SELECT id, email FROM users LIMIT 5");
    console.log("Sample users:", usersData.rows);

    // Check ideas table
    console.log("\n--- Ideas Table ---");
    const ideasResult = await pool.query("SELECT COUNT(*) as count FROM ideas");
    console.log(`Total ideas: ${ideasResult.rows[0].count}`);
    const ideasData = await pool.query(
      "SELECT id, user_id, title FROM ideas LIMIT 5"
    );
    console.log("Sample ideas:", ideasData.rows);

    // Check idea_likes table
    console.log("\n--- Idea Likes Table ---");
    const likesResult = await pool.query("SELECT COUNT(*) as count FROM idea_likes");
    console.log(`Total likes: ${likesResult.rows[0].count}`);

    // Check tags table
    console.log("\n--- Tags Table ---");
    const tagsResult = await pool.query("SELECT COUNT(*) as count FROM tags");
    console.log(`Total tags: ${tagsResult.rows[0].count}`);

    // Get the specific idea that's failing
    console.log("\n--- Bio-Acoustic Idea (if it exists) ---");
    const bioResult = await pool.query(
      `SELECT id, title, user_id FROM ideas WHERE title LIKE '%Bio-Acoustic%'`
    );
    if (bioResult.rows.length > 0) {
      console.log("Found:", bioResult.rows[0]);
    } else {
      console.log("Not found - checking all ideas:");
      const allIdeas = await pool.query("SELECT id, title FROM ideas");
      console.log(JSON.stringify(allIdeas.rows, null, 2));
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

debugDatabase();
