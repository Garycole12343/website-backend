// Find similar users
fetch('/api/users/similar?email=john@example.com&limit=5')
  .then(res => res.json())
  .then(data => console.log(data.matches));

// Semantic search
fetch('/api/users/search', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    query: 'python developer interested in machine learning',
    limit: 10
  })
})
.then(res => res.json())
.then(data => console.log(data.results));

// Get recommendations
fetch('/api/users/recommendations?email=john@example.com')
  .then(res => res.json())
  .then(data => {
    console.log('Similar users:', data.similar_users);
    console.log('Recommended resources:', data.recommended_resources);
  });