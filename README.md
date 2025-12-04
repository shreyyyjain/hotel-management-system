# 🏨 Hotel Paradise - Hotel Management System

A full-stack hotel management application with a modern, responsive UI and robust backend API. Built with Spring Boot, React, TypeScript, and PostgreSQL.

![Hotel Paradise](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Java](https://img.shields.io/badge/Java-21-orange)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.15-blue)

## ✨ Features

### User Features
- 🔐 **Secure Authentication** - JWT-based authentication with refresh tokens
- 🏨 **Room Booking** - Browse and book from various room types (Single, Double, Deluxe, Suite, Presidential)
- 🍽️ **Food Ordering** - Order from a diverse menu with multiple cuisines
- 📅 **Date Selection** - Flexible check-in/check-out date selection with validation
- 🛒 **Shopping Cart** - Add/remove rooms and food items before confirmation
- 📋 **Booking History** - View, manage, and track all bookings with detailed information
- 📊 **Dashboard** - Quick access to stats and key actions
- 💳 **Order Summary** - Clear pricing breakdown with subtotals and totals
- ✅ **Real-time Validation** - Quantity limits, date validation, and availability checks

### Technical Features
- 📱 **Fully Responsive** - Mobile-first design with Tailwind CSS
- ♿ **Accessible** - WCAG compliant with keyboard navigation and ARIA labels
- 🎨 **Modern UI/UX** - F-pattern layout with consistent design system
- 🚀 **Performance** - Optimized rendering and lazy loading
- 🔄 **State Management** - React Context API for global state
- 🛡️ **Type Safety** - Full TypeScript implementation
- 🗄️ **Database Migrations** - Flyway for version-controlled schema changes
- 📝 **API Documentation** - RESTful endpoints with clear contracts

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.9.6
- **Styling**: Tailwind CSS 4.1.17
- **HTTP Client**: Axios 1.13.2
- **Notifications**: React Hot Toast 2.6.0
- **UI Components**: Headless UI 2.2.9, Heroicons 2.2.0

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 21
- **Security**: Spring Security 6.1.5 with JWT
- **Database**: PostgreSQL 15.15
- **ORM**: Hibernate 6.3.1 / Spring Data JPA
- **Migration**: Flyway 9.22.3
- **Build Tool**: Maven 3.9.x
- **Server**: Apache Tomcat 10.1.16 (Embedded)

### Database Schema
- **Users** - Authentication and user management
- **Rooms** - Room inventory with types and pricing
- **Food Items** - Menu items with cuisines
- **Bookings** - Order history with room and food associations
- **Refresh Tokens** - JWT refresh token management

## 📁 Project Structure

```
Hotel Management System/
├── Hotel Management Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/shrey/hotel/
│   │   │   │   ├── config/         # Configuration classes
│   │   │   │   ├── controller/     # REST API endpoints
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── exception/      # Custom exceptions
│   │   │   │   ├── model/          # JPA entities
│   │   │   │   ├── repository/     # Data access layer
│   │   │   │   ├── security/       # JWT & security filters
│   │   │   │   └── service/        # Business logic
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       ├── application-prod.properties
│   │   │       └── db/migration/   # Flyway SQL migrations
│   │   └── test/                   # Integration tests
│   ├── target/                     # Build output
│   ├── pom.xml                     # Maven dependencies
│   └── Dockerfile                  # Docker configuration
│
├── Hotel Management Frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── SkeletonLoader.tsx
│   │   ├── context/                # React Context providers
│   │   │   └── AppContext.tsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   └── useAuth.ts
│   │   ├── pages/                  # Route components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── BookingHistory.tsx
│   │   ├── services/               # API clients
│   │   │   ├── apiClient.ts
│   │   │   ├── authService.ts
│   │   │   └── dataService.ts
│   │   ├── types/                  # TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── App.tsx                 # Root component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── public/                     # Static assets
│   ├── package.json                # npm dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── vite.config.ts              # Vite config
│   ├── tailwind.config.js          # Tailwind config
│   └── eslint.config.js            # ESLint config
│
├── docker-compose.yml              # Multi-container setup
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Java 21** or higher
- **Node.js 18** or higher
- **PostgreSQL 15** or higher
- **Maven 3.9** or higher
- **npm** or **yarn**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shreyyyjain/hotel-management-system.git
   cd hotel-management-system
   ```

2. **Configure PostgreSQL**
   ```bash
   # Create database
   createdb hotel_management
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE hotel_management;
   ```

3. **Update database credentials**
   
   Edit `Hotel Management Backend/src/main/resources/application-dev.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/hotel_management
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. **Build and run the backend**
   ```bash
   cd "Hotel Management Backend"
   
   # Build the project
   mvn clean package -DskipTests
   
   # Run the application
   java -jar target/hotel-management-api-0.2.0.jar
   
   # Or using Maven
   mvn spring-boot:run
   ```

   Backend will start on `http://localhost:8080/api`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd "Hotel Management Frontend"
   npm install
   ```

2. **Configure API endpoint** (if needed)
   
   Update `src/services/apiClient.ts`:
   ```typescript
   const apiClient = axios.create({
     baseURL: 'http://localhost:8080/api',
     // ...
   });
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   Frontend will start on `http://localhost:5173`

### Docker Setup (Optional)

```bash
# Build and run all services
docker-compose up -d

# Stop all services
docker-compose down
```

## 📊 Database Schema

### Users Table
- `id` (BIGSERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `full_name` (VARCHAR)
- `password` (VARCHAR) - Bcrypt hashed
- `created_at` (TIMESTAMP)

### Rooms Table
- `id` (BIGSERIAL PRIMARY KEY)
- `room_number` (INT UNIQUE)
- `room_type` (VARCHAR) - SINGLE, DOUBLE, DELUXE, SUITE, PRESIDENTIAL
- `price_per_night` (NUMERIC)
- `available` (BOOLEAN)

### Food Items Table
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `cuisine` (VARCHAR)
- `price` (NUMERIC)
- `image_url` (VARCHAR)

### Bookings Table
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT FK → users)
- `total_amount` (NUMERIC)
- `check_in_date` (DATE)
- `check_out_date` (DATE)
- `status` (VARCHAR) - PENDING, CONFIRMED, CANCELLED, COMPLETED
- `created_at` (TIMESTAMP)
- `food_quantities` (TEXT) - JSON string
- Many-to-Many relationships with rooms and food_items

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/logout` - Logout and invalidate refresh token
- `POST /api/auth/refresh` - Refresh access token

### Rooms
- `GET /api/rooms` - Get all rooms (paginated)
- `GET /api/rooms/{id}` - Get room by ID
- `POST /api/rooms/{id}/book` - Book a room

### Food Items
- `GET /api/food-items` - Get all food items (paginated)
- `GET /api/food-items/cuisine/{cuisine}` - Get food by cuisine
- `GET /api/food-items/cuisines` - Get all cuisines

### Cart
- `GET /api/cart` - Get current cart
- `POST /api/cart/rooms` - Add room to cart
- `POST /api/cart/food` - Add food to cart
- `DELETE /api/cart/{type}/{id}` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/checkout` - Complete booking

### Bookings
- `GET /api/bookings/my-history` - Get user's booking history
- `PUT /api/bookings/{id}/status` - Update booking status

## 🔐 Security

- **JWT Authentication**: Stateless authentication with access and refresh tokens
- **Password Hashing**: Bcrypt with strength 12
- **CORS**: Configured for development and production origins
- **CSRF Protection**: Disabled for stateless API
- **SQL Injection**: Prevented through JPA/Hibernate parameterized queries
- **XSS Protection**: React's built-in escaping
- **Input Validation**: Server-side validation with Bean Validation

## 🎨 Design System

### Color Palette
- **Primary**: `#0056D6` (Blue) - Main brand color
- **Secondary**: `#003580` (Dark Blue) - Headers and emphasis
- **Accent**: `#F4B400` (Yellow/Gold) - CTAs and highlights
- **Success**: `#10B981` (Green) - Positive actions
- **Error**: `#EF4444` (Red) - Warnings and errors
- **Neutral**: Gray scale for backgrounds and text

### Typography
- **Font Family**: System fonts for performance
- **Headings**: Bold, uppercase with letter spacing
- **Body**: Regular weight, optimal line height

### Spacing
- Based on 4px grid system
- Consistent padding and margins
- Responsive breakpoints (sm, md, lg, xl)

## 🧪 Testing

### Backend Tests
```bash
cd "Hotel Management Backend"
mvn test
```

### Frontend Tests
```bash
cd "Hotel Management Frontend"
npm run test
```

## 📦 Building for Production

### Backend
```bash
cd "Hotel Management Backend"
mvn clean package -DskipTests
# Output: target/hotel-management-api-0.2.0.jar
```

### Frontend
```bash
cd "Hotel Management Frontend"
npm run build
# Output: dist/ folder ready for deployment
```

## 🌐 Deployment

### Backend Deployment (Example: Railway/Heroku)
1. Set environment variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DATABASE_URL`
   - `JWT_SECRET`
   
2. Deploy JAR file or use Docker image

### Frontend Deployment (Example: Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Update API base URL in environment variables

## 🐛 Known Issues & Future Enhancements

### Known Issues
- None currently reported

### Planned Features
- [ ] Payment gateway integration
- [ ] Email notifications for bookings
- [ ] Admin panel for managing rooms and food items
- [ ] Real-time availability updates using WebSockets
- [ ] Multi-language support
- [ ] Customer reviews and ratings
- [ ] Room amenities filtering
- [ ] Photo galleries for rooms
- [ ] Booking modification/cancellation
- [ ] Loyalty points system

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Shrey Jain**
- GitHub: [@shreyyyjain](https://github.com/shreyyyjain)
- Repository: [hotel-management-system](https://github.com/shreyyyjain/hotel-management-system)

## 🙏 Acknowledgments

- Spring Boot documentation
- React and TypeScript communities
- Tailwind CSS for the utility-first CSS framework
- PostgreSQL team
- All open-source contributors

---

**Built with ❤️ for learning and demonstration purposes**
