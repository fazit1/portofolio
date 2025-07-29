// my-cms-backend/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based version
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database!');
        connection.release(); // Release the connection
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err.message);
    });

// --- API Endpoints for Portfolio (index.html) ---

// Get all portfolio data
app.get('/api/portfolio', async (req, res) => {
    try {
        const [personalInfo] = await pool.query('SELECT * FROM personal_info LIMIT 1');
        const [skills] = await pool.query('SELECT * FROM skills ORDER BY id ASC');
        const [experiences] = await pool.query('SELECT * FROM experiences ORDER BY id ASC');
        const [projects] = await pool.query('SELECT * FROM projects ORDER BY id ASC');
        const [organizations] = await pool.query('SELECT * FROM organizations ORDER BY id ASC');

        res.json({
            personalInfo: personalInfo[0] || {},
            skills,
            experiences,
            projects,
            organizations
        });
    } catch (err) {
        console.error('Error fetching portfolio data:', err);
        res.status(500).json({ message: 'Error fetching portfolio data', error: err.message });
    }
});

// Update Personal Info
app.put('/api/portfolio/personal-info', async (req, res) => {
    const { name, title } = req.body;
    try {
        await pool.query('UPDATE personal_info SET name = ?, title = ? WHERE id = 1', [name, title]);
        res.status(200).json({ message: 'Personal info updated successfully.' });
    } catch (err) {
        console.error('Error updating personal info:', err);
        res.status(500).json({ message: 'Error updating personal info', error: err.message });
    }
});

// Add Skill
app.post('/api/portfolio/skills', async (req, res) => {
    const { name, icon, level, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO skills (name, icon, level, description) VALUES (?, ?, ?, ?)', [name, icon, level, description]);
        res.status(201).json({ message: 'Skill added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error adding skill:', err);
        res.status(500).json({ message: 'Error adding skill', error: err.message });
    }
});

// Update Skill
app.put('/api/portfolio/skills/:id', async (req, res) => {
    const { id } = req.params;
    const { name, icon, level, description } = req.body;
    try {
        const [result] = await pool.query('UPDATE skills SET name = ?, icon = ?, level = ?, description = ? WHERE id = ?', [name, icon, level, description, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Skill not found.' });
        }
        res.status(200).json({ message: 'Skill updated successfully.' });
    } catch (err) {
        console.error('Error updating skill:', err);
        res.status(500).json({ message: 'Error updating skill', error: err.message });
    }
});

// Delete Skill
app.delete('/api/portfolio/skills/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM skills WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Skill not found.' });
        }
        res.status(200).json({ message: 'Skill deleted successfully.' });
    } catch (err) {
        console.error('Error deleting skill:', err);
        res.status(500).json({ message: 'Error deleting skill', error: err.message });
    }
});

// Add Experience
app.post('/api/portfolio/experiences', async (req, res) => {
    const { period, title, company, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO experiences (period, title, company, description) VALUES (?, ?, ?, ?)', [period, title, company, description]);
        res.status(201).json({ message: 'Experience added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error adding experience:', err);
        res.status(500).json({ message: 'Error adding experience', error: err.message });
    }
});

// Update Experience
app.put('/api/portfolio/experiences/:id', async (req, res) => {
    const { id } = req.params;
    const { period, title, company, description } = req.body;
    try {
        const [result] = await pool.query('UPDATE experiences SET period = ?, title = ?, company = ?, description = ? WHERE id = ?', [period, title, company, description, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Experience not found.' });
        }
        res.status(200).json({ message: 'Experience updated successfully.' });
    } catch (err) {
        console.error('Error updating experience:', err);
        res.status(500).json({ message: 'Error updating experience', error: err.message });
    }
});

// Delete Experience
app.delete('/api/portfolio/experiences/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM experiences WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Experience not found.' });
        }
        res.status(200).json({ message: 'Experience deleted successfully.' });
    } catch (err) {
        console.error('Error deleting experience:', err);
        res.status(500).json({ message: 'Error deleting experience', error: err.message });
    }
});

// Add Project
app.post('/api/portfolio/projects', async (req, res) => {
    const { year, title, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO projects (year, title, description) VALUES (?, ?, ?)', [year, title, description]);
        res.status(201).json({ message: 'Project added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error adding project:', err);
        res.status(500).json({ message: 'Error adding project', error: err.message });
    }
});

// Update Project
app.put('/api/portfolio/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { year, title, description } = req.body;
    try {
        const [result] = await pool.query('UPDATE projects SET year = ?, title = ?, description = ? WHERE id = ?', [year, title, description, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(200).json({ message: 'Project updated successfully.' });
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ message: 'Error updating project', error: err.message });
    }
});

// Delete Project
app.delete('/api/portfolio/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ message: 'Error deleting project', error: err.message });
    }
});

// Add Organization
app.post('/api/portfolio/organizations', async (req, res) => {
    const { period, title, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO organizations (period, title, description) VALUES (?, ?, ?)', [period, title, description]);
        res.status(201).json({ message: 'Organization added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error adding organization:', err);
        res.status(500).json({ message: 'Error adding organization', error: err.message });
    }
});

// Update Organization
app.put('/api/portfolio/organizations/:id', async (req, res) => {
    const { id } = req.params;
    const { period, title, description } = req.body;
    try {
        const [result] = await pool.query('UPDATE organizations SET period = ?, title = ?, description = ? WHERE id = ?', [period, title, description, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Organization not found.' });
        }
        res.status(200).json({ message: 'Organization updated successfully.' });
    } catch (err) {
        console.error('Error updating organization:', err);
        res.status(500).json({ message: 'Error updating organization', error: err.message });
    }
});

// Delete Organization
app.delete('/api/portfolio/organizations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM organizations WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Organization not found.' });
        }
        res.status(200).json({ message: 'Organization deleted successfully.' });
    } catch (err) {
        console.error('Error deleting organization:', err);
        res.status(500).json({ message: 'Error deleting organization', error: err.message });
    }
});


// --- API Endpoints for News (news.html) ---

// Get all news articles
app.get('/api/news', async (req, res) => {
    try {
        const [articles] = await pool.query('SELECT * FROM news_articles ORDER BY date DESC');
        res.json(articles);
    } catch (err) {
        console.error('Error fetching news articles:', err);
        res.status(500).json({ message: 'Error fetching news articles', error: err.message });
    }
});

// Get a single news article by ID
app.get('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [article] = await pool.query('SELECT * FROM news_articles WHERE id = ?', [id]);
        if (article.length === 0) {
            return res.status(404).json({ message: 'News article not found.' });
        }
        res.json(article[0]);
    } catch (err) {
        console.error('Error fetching news article:', err);
        res.status(500).json({ message: 'Error fetching news article', error: err.message });
    }
});

// Add News Article
app.post('/api/news', async (req, res) => {
    const { category, badge, title, summary, content, image_url, trending } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO news_articles (category, badge, title, summary, content, image_url, trending) VALUES (?, ?, ?, ?, ?, ?, ?)', [category, badge, title, summary, content, image_url, trending]);
        res.status(201).json({ message: 'News article added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error adding news article:', err);
        res.status(500).json({ message: 'Error adding news article', error: err.message });
    }
});

// Update News Article
app.put('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    const { category, badge, title, summary, content, image_url, trending } = req.body;
    try {
        const [result] = await pool.query('UPDATE news_articles SET category = ?, badge = ?, title = ?, summary = ?, content = ?, image_url = ?, trending = ? WHERE id = ?', [category, badge, title, summary, content, image_url, trending, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'News article not found.' });
        }
        res.status(200).json({ message: 'News article updated successfully.' });
    } catch (err) {
        console.error('Error updating news article:', err);
        res.status(500).json({ message: 'Error updating news article', error: err.message });
    }
});

// Delete News Article
app.delete('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM news_articles WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'News article not found.' });
        }
        res.status(200).json({ message: 'News article deleted successfully.' });
    } catch (err) {
        console.error('Error deleting news article:', err);
        res.status(500).json({ message: 'Error deleting news article', error: err.message });
    }
});

// --- API Endpoints for Profile (profile.html) ---

// Get Contact Info and Services (used by profile.html)
app.get('/api/profile', async (req, res) => {
    try {
        const [contactInfo] = await pool.query('SELECT * FROM contact_info LIMIT 1');
        const [services] = await pool.query('SELECT * FROM services ORDER BY id ASC');
        res.json({
            contactInfo: contactInfo[0] || {},
            services
        });
    } catch (err) {
        console.error('Error fetching profile data:', err);
        res.status(500).json({ message: 'Error fetching profile data', error: err.message });
    }
});

// Update Contact Info
app.put('/api/profile/contact-info', async (req, res) => {
    const { email, phone, whatsapp_link, telegram_link, instagram_link, linkedin_link, github_link } = req.body;
    try {
        const [result] = await pool.query(`
            UPDATE contact_info
            SET email = ?, phone = ?, whatsapp_link = ?, telegram_link = ?, instagram_link = ?, linkedin_link = ?, github_link = ?
            WHERE id = 1
        `, [email, phone, whatsapp_link, telegram_link, instagram_link, linkedin_link, github_link]);

        if (result.affectedRows === 0) {
            // If ID 1 doesn't exist, insert a new row
            await pool.query(`
                INSERT INTO contact_info (email, phone, whatsapp_link, telegram_link, instagram_link, linkedin_link, github_link)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [email, phone, whatsapp_link, telegram_link, instagram_link, linkedin_link, github_link]);
            res.status(201).json({ message: 'Contact info added successfully.' });
        } else {
            res.status(200).json({ message: 'Contact info updated successfully.' });
        }
    } catch (err) {
        console.error('Error updating contact info:', err);
        res.status(500).json({ message: 'Error updating contact info', error: err.message });
    }
});


// Add Service
app.get('/api/services', async (req, res) => {
    try {
        const [services] = await pool.query('SELECT * FROM services ORDER BY id ASC');
        res.json(services);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ message: 'Error fetching services', error: err.message });
    }
});
// Update Service
app.put('/api/profile/services/:id', async (req, res) => {
    const { id } = req.params;
    const { title, price, description, icon } = req.body;
    try {
        const [result] = await pool.query('UPDATE services SET title = ?, price = ?, description = ?, icon = ? WHERE id = ?', [title, price, description, icon, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        res.status(200).json({ message: 'Service updated successfully.' });
    } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ message: 'Error updating service', error: err.message });
    }
});

// Delete Service
app.delete('/api/profile/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        res.status(200).json({ message: 'Service deleted successfully.' });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ message: 'Error deleting service', error: err.message });
    }
});


// --- API Endpoints for Contact Messages (profile.html to admin.html) ---

// POST endpoint to receive new contact messages
app.post('/api/contact-messages', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Nama, email, dan pesan wajib diisi.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        res.status(201).json({ success: true, message: 'Pesan berhasil dikirim!', id: result.insertId });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan pesan kontak.', error: error.message });
    }
});

// GET endpoint to retrieve all contact messages
app.get('/api/contact-messages', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil pesan kontak.', error: error.message });
    }
});

// POST endpoint to delete a contact message
app.post('/api/contact-messages/delete', async (req, res) => {
    const { id } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID pesan tidak valid.' });
    }

    try {
        const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Pesan berhasil dihapus.' });
        } else {
            res.status(404).json({ success: false, message: 'Pesan tidak ditemukan atau sudah dihapus.' });
        }
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus pesan.', error: error.message });
    }
});

// --- NEW API Endpoint for Admin Profile Management ---
// This endpoint will fetch all relevant profile data for the admin page
app.get('/api/admin/profile-management', async (req, res) => {
    try {
        const [personalInfo] = await pool.query('SELECT * FROM personal_info LIMIT 1');
        const [skills] = await pool.query('SELECT * FROM skills ORDER BY id ASC');
        const [experiences] = await pool.query('SELECT * FROM experiences ORDER BY id ASC');
        const [projects] = await pool.query('SELECT * FROM projects ORDER BY id ASC');
        const [organizations] = await pool.query('SELECT * FROM organizations ORDER BY id ASC');
        const [contactInfo] = await pool.query('SELECT * FROM contact_info LIMIT 1');
        const [services] = await pool.query('SELECT * FROM services ORDER BY id ASC');
        const [newsArticles] = await pool.query('SELECT * FROM news_articles ORDER BY date DESC');
        const [contactMessages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');


        res.json({
            personalInfo: personalInfo[0] || {},
            skills,
            experiences,
            projects,
            organizations,
            contactInfo: contactInfo[0] || {},
            services,
            newsArticles,
            contactMessages
        });
    } catch (err) {
        console.error('Error fetching admin profile data:', err);
        res.status(500).json({ message: 'Error fetching admin profile data', error: err.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
