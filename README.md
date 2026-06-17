# Kaaryakarni - Donation Management System

A robust, transparent donation management platform engineered to deliver financial transparency for charitable organizations and individual donors in India.

## Features

- **Member Registration & Authentication**: Secure signup/signin with OTP verification
- **Donation Portal**: Guest and member donation processing with INR support
- **Admin Dashboard**: Comprehensive audit and management interface with 2FA security
- **PDF Receipt Generation**: Automated receipt downloads for all transactions
- **Database Logging**: Complete transaction tracking and member management
- **Mobile-Responsive UI**: Clean, modern interface built with vanilla HTML, CSS, and JavaScript

## Project Structure

```
Karyakarni-Donation-project/
├── index.html          # Main frontend application
├── server.js          # Express.js backend server
├── karyakarni_DB.sql  # MySQL database schema
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0+
- **Libraries**: jsPDF (for receipt generation)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- A modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsyashagarwalya-max/Karyakarni-Donation-project.git
   cd Karyakarni-Donation-project
   ```

2. **Setup Database**
   - Open MySQL Workbench or MySQL CLI
   - Run the SQL commands from `karyakarni_DB.sql`
   ```bash
   mysql -u root -p < karyakarni_DB.sql
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Update Database Credentials** (in `server.js`)
   - Update `host`, `user`, `password` in the `dbConfig` object

5. **Start the Server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`

6. **Open the Application**
   - Open `index.html` in your web browser, or
   - Serve it via a local web server

## API Endpoints

### Member Registration
- **POST** `/api/members/signup`
  - Registers a new member with name, email, and mobile number

### Donations
- **POST** `/api/donations/add`
  - Records a new donation (member or guest)
  - Supports INR currency

## Admin Credentials (Default)

- **Email/ID**: `admin@kaaryakarni.org`
- **Password**: `Admin@123`
- **Note**: Replace with secure credentials in production

## Features Walkthrough

### Landing Page
- Brand introduction with donation CTA
- Member signup/signin options
- Admin console access

### Member Dashboard
- Personalized greeting
- Payment processing portal
- Profile management

### Donation Flow
- Guest or member donation submission
- OTP verification
- Transaction confirmation
- PDF receipt download

### Admin Panel
- Member database viewing
- Donation transaction logs
- 2FA security verification

## Security Notes

- OTP codes are displayed in console for testing (production should use SMS services)
- Admin passwords must be hashed using bcrypt or Argon2 in production
- Implement proper environment variables for sensitive credentials
- Use HTTPS in production

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bug reports.

## License

MIT License - See LICENSE file for details

## Support

For support, please contact: support@kaaryakarni.org
