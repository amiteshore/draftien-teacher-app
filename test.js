const http = require('http');

const data = JSON.stringify({
  email: 'teacher@example.com',
  password: 'Password123!'
});

const req = http.request('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const token = JSON.parse(body).data.token;
    
    // get course id
    http.get('http://localhost:3000/courses', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        const courseId = JSON.parse(body2).data[0].id;
        
        // get announcements
        http.get('http://localhost:3000/announcements/' + courseId, {
          headers: { 'Authorization': 'Bearer ' + token }
        }, (res3) => {
          let body3 = '';
          res3.on('data', chunk => body3 += chunk);
          res3.on('end', () => {
            const anns = JSON.parse(body3).data;
            if (anns.length === 0) {
              console.log("No announcements");
              return;
            }
            const annId = anns[0].id;
            console.log("announcement", anns[0]);
            
            // fetch attachments
            http.get('http://localhost:3000/announcements/' + annId + '/attachments', {
              headers: { 'Authorization': 'Bearer ' + token }
            }, (res4) => {
              let body4 = '';
              res4.on('data', chunk => body4 += chunk);
              res4.on('end', () => {
                console.log("attachments response:", res4.statusCode, body4);
              });
            });
          });
        });
      });
    });
  });
});
req.write(data);
req.end();
