# Medical Store Billing System

A comprehensive multi-merchant medical store billing system with inventory management, GST calculation, and printable bills.

## Features

### Multi-Merchant Support
- Separate merchant registration and login
- Isolated inventory and billing for each merchant
- Secure authentication with JWT tokens

### Inventory Management
- Upload stock via Excel files
- Manual item addition
- Category-wise organization (Tablets, Syrups, Injections, Capsules, Ointments)
- Stock tracking with batch numbers and expiry dates

### Billing System
- Category-wise item selection
- Real-time stock validation
- GST calculation (configurable per item)
- Discount percentage option (default 0%)
- Printable bills with detailed breakdown
- Customer information capture

### Database Features
- MySQL database with proper relationships
- Stock movement tracking
- Bill history with reprint functionality
- Merchant-specific data isolation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Database Setup
1. Create a MySQL database named `medical_store_billing`
2. Import the schema from `database/schema.sql`
3. Update database credentials in `.env` file

### Backend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start the server
npm run server
```

### Frontend Setup
```bash
# Install client dependencies
cd client
npm install

# Start the React app
npm start
```

### Full Development Setup
```bash
# Install all dependencies
npm install
npm run install-client

# Start both server and client
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=medical_store_billing
JWT_SECRET=generate_a_secure_random_key_here
PORT=5000
```

## Excel Upload Format

Create an Excel file with the following columns:
- `name`: Item name
- `category`: tablets, syrups, injections, capsules, ointments, general
- `quantity`: Stock quantity
- `price`: Unit price
- `gst`: GST rate (percentage)
- `batch_number`: Batch number (optional)
- `manufacturer`: Manufacturer name (optional)

See `sample_inventory.xlsx` for reference.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new merchant
- `POST /api/auth/login` - Merchant login

### Inventory (Protected)
- `GET /api/inventory` - Get merchant inventory
- `POST /api/inventory/excel` - Upload Excel file
- `POST /api/inventory/manual` - Add item manually

### Billing (Protected)
- `POST /api/bills` - Create new bill
- `GET /api/bills` - Get bill history
- `GET /api/bills/:id` - Get specific bill details

## Deployment on GoDaddy

### Database Setup
1. Create MySQL database in GoDaddy cPanel
2. Import the schema from `database/schema.sql`
3. Note down database credentials

### File Upload
1. Upload all files to your hosting directory
2. Update `.env` with production database credentials
3. Install dependencies: `npm install --production`

### Start Application
```bash
# Production start
npm start
```

### Build Frontend for Production
```bash
cd client
npm run build
```

## Usage

### Merchant Registration
1. Visit `/register` to create a new merchant account
2. Fill in store details, owner information, and credentials
3. Login with registered credentials

### Inventory Management
1. Navigate to Inventory section
2. Upload Excel file or add items manually
3. Items are categorized automatically
4. Stock levels are tracked in real-time

### Creating Bills
1. Go to Billing section
2. Select items by category or search
3. Add items to cart with quantities
4. Enter customer details (optional)
5. Apply discount if needed
6. Generate and print bill

### Bill Management
1. View all bills in Bill History
2. Reprint any previous bill
3. Track sales and customer information

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Merchant data isolation
- SQL injection protection
- Input validation and sanitization

## Database Schema

### Tables
- `merchants`: Store merchant information
- `inventory`: Merchant-specific inventory
- `bills`: Bill records
- `bill_items`: Individual bill items
- `stock_movements`: Inventory change tracking

## Support

For issues or questions, please check the documentation or contact support.

## License

This project is licensed under the MIT License.