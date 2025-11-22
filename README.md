# TVCastAPI

A RESTful API that utilizes web scraping to fetch TV Live channel content. Get channel details, streaming links, categories, and search functionality.

## Features

- 🚫 **No Authentication Required** - Open API, no API keys needed
- ⚡ **Redis Caching** - Optional Redis caching for improved performance
- 📺 **Multiple Categories** - Trending, sports, news, documentary, kids, and islamic channels
- 🛡️ **Rate Limiting** - Built-in rate limiting to prevent abuse
- 🚀 **Fast & Reliable** - Optimized scraping with caching and error handling

## Installation

### Prerequisites

- Node.js (LTS version recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/mosabbir-maruf/TVCastAPI.git
cd TVCastAPI

# Install dependencies
npm install

# Start the server
npm run dev
```

Server will run on `http://localhost:3030`

## Environment Variables

All environment variables are optional. Create a `.env` file in the root directory:

```env
PORT=3030
NODE_ENV=development
ORIGIN=*
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_LIMIT=100
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

See `env.example` for detailed descriptions.

## API Endpoints

Base URL: `/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/home` | Fetch homepage with channels by categories |
| GET | `/channel/:id` | Get channel details by ID |
| GET | `/channels/:query` | Get channels by category (with pagination) |
| GET | `/categories/:query` | Alternative endpoint for channels by category |
| GET | `/search?keyword=...` | Search channels by keyword |
| GET | `/servers?id=...` | Get available streaming servers for a channel |
| GET | `/stream?id=...` | Get stream URL for a TV channel |

## Deployment

The API is optimized for **Render** deployment with full Puppeteer support for complete functionality.

See `DEPLOYMENT.md` for detailed deployment instructions.

## Important Notes

⚠️ This is an **unofficial API** and is in no way officially related to any TV streaming service. The content provided is not hosted by us. All content belongs to their respective owners.

## License

This project is for educational purposes.

## Author

**Mosabbir Maruf**

- GitHub: [@mosabbir-maruf](https://github.com/mosabbir-maruf)

