async function testLogin() {
  try {
    const response = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'thiagoeucosta@gmail.com',
        senha: '123456'
      })
    });

    const data = await response.json();
    console.log('Login Response:', JSON.stringify(data, null, 2));
    
    if (data.sucesso && data.dados.token) {
      console.log('\n🔑 Token:', data.dados.token);
      return data.dados.token;
    }
  } catch (error) {
    console.error('Erro no login:', error);
  }
}

testLogin();
