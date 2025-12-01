const jwt = require('jsonwebtoken');

// Demo JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-super-secret-jwt-key-here';

// Function to create a JWT token
function createJWTToken(userData) {
  const payload = {
    id: userData.id,
    name: userData.name,
    role: userData.role,
    iat: Math.floor(Date.now() / 1000), // issued at time
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // expires in 1 hour
  };

  const token = jwt.sign(payload, JWT_SECRET);
  return token;
}

// Function to verify a JWT token
function verifyJWTToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Demo usage
console.log('🔑 JWT Token Demo\n');

// Create sample user data
const teacherData = {
  id: 'teacher_123',
  name: 'John Smith',
  role: 'teacher'
};

const studentData = {
  id: 'student_456',
  name: 'Jane Doe',
  role: 'student'
};

// Generate JWT tokens
console.log('👨‍🏫 TEACHER TOKEN:');
const teacherToken = createJWTToken(teacherData);
console.log(teacherToken);
console.log('\n🔍 Decoded Teacher Token:', jwt.decode(teacherToken));

console.log('\n👨‍🎓 STUDENT TOKEN:');
const studentToken = createJWTToken(studentData);
console.log(studentToken);
console.log('\n🔍 Decoded Student Token:', jwt.decode(studentToken));

// Verify tokens
console.log('\n✅ VERIFICATION:');
console.log('Teacher token valid:', verifyJWTToken(teacherToken));
console.log('Student token valid:', verifyJWTToken(studentToken));

// Try invalid token
console.log('\n❌ INVALID TOKEN TEST:');
console.log('Invalid token result:', verifyJWTToken('invalid.token.here'));

module.exports = { createJWTToken, verifyJWTToken };