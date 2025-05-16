# Bstream
Bstream is a platform that enables Twitch streamers to receive cryptocurrency tips directly from their audience. The platform simplifies the process of accepting cryptocurrency donations by providing personalized donation links and real-time alerts.

These custom Donation links can be uploaded in stream chat for users to redirect to donation page.

## Getting Started
Clone the Github Repository:
```
https://github.com/Hack-Archive/Bstream.git
```
Navigate to folder:
```
cd Bstream
```
Install node modules:
```
npm install
```
Run the server:
```
npm run dev
```
## Setup .env file
Create .env file in root:
```
touch .env
```
Should contain necessary API keys:
```
# Twitch API Credentials
NEXT_PUBLIC_TWITCH_CLIENT_ID=ID
TWITCH_CLIENT_SECRET=CLIENT_SECRET_KEY
NEXTAUTH_SECRET="SECRET_KEY"
NEXTAUTH_URL="http://localhost:3000"
```
