const express = require ('express');
const mysql = require ('mysql2');
const app = express();
const session = require ('express-session');
const path = require('path');
const bodyParser = require ('body-parser');
const port = 7001;

app.set('view engine', 'ejs');


app.use(express.urlencoded( {extended: true }));
app.use(express.json());

app.use(express.static('views/assets/styles'));
app.use(express.static('css'));

app.use(express.static('views'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
    app.use(express.static('/views'));
  });

  app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
  });
  //login and cadastro

  const db = mysql.createConnection({
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'flamengo',
    database: 'brito',
  });
  //sem o db conect, o servidor não é ativado, lembrar-se 
  db.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
    } else {
      console.log('Conexão com o banco de dados estabelecida com sucesso!');
    }
  });


  app.post('/cadastro', (req, res) =>{
    const {name, senha} = req.body;
    console.log(name, senha);
    var SQL = 'INSERT INTO dados (name, senha) VALUES (?, ?)';
    db.query(SQL, [name, senha],(err, result) =>{
        if(err){
            console.error('Erro ao cadastrar o usuário:', err);
      res.status(500).send('Erro ao cadastrar o usuário.');
        }else{
            res.redirect('/login');
            
        }}
  )});
  function isAuthenticated(req, res, next) {
    // Verifique se a sessão contém informações do usuário
    if (req.session && req.session.user && req.session.user.tipo.toLowerCase() === 'administrador')  {
        return next();
    } else {
        // Redirecione para a página de login se não estiver autenticado
        res.redirect('/login');
    }
  }
  app.post('/login', (req, res) => {
    const { namelogin, senhalogin } = req.body;
    var query = 'SELECT name, senha FROM dados WHERE name = ? AND senha = ?';
    db.query(query, [namelogin, senhalogin], (err, result) => {
        if (err) {
            console.error('Erro ao logar o usuário:', err);
            res.status(500).send('Erro ao logar o usuário.');
        } else if (result.length > 0) {
            res.redirect('/user');
        } else {
            console.log('senha errada');
            res.redirect('/login',{ data: req.session.user });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
      console.log('Desconectado')
    });
  });
 
    app.post('/blogwrite', (req, res) =>{
        const {titulo, texto} = req.body;
        
        var SQL = 'INSERT INTO blog (titulo, texto) VALUES (?, ?)';
        db.query(SQL, [titulo, texto],(err, row) =>{
            if(err){
                console.error('Erro ao cadastrar o usuário:', err);
          res.status(500).send('Erro ao cadastrar o usuário.');
            }else{
                console.log('certo');
                res.redirect('/poste');
            }}
      )});

  ;
  app.get('/blogpage',(req,res)=>{
    res.render('adm2');
  })
  app.get('/user', isAuthenticated ,(req,res)=>{
    res.render('homeuser',{data: req.session.user});
  })
  
  app.get('/login', (req,res)=>{
    res.render('login');
  });
  app.get('/poste', (req, res) => {
    // Chama a função para obter os dados do banco
    obterDadosDoBanco((err, dados) => {
        if (err) {
            console.error('Erro ao obter dados do banco:', err);
            res.status(500).send('Erro ao obter dados do banco.');
        } else {
            // Renderiza a página EJS com os dados obtidos
            res.render('postagens', { data: dados });
        }
    });
});

// Função para obter dados do banco
function obterDadosDoBanco(callback) {
    var SQL = "SELECT * FROM blog";
    db.query(SQL, (err, rows) => {
        if (err) {
            console.error('Erro na consulta do banco:', err);
            callback(err, null);
        } else {
            // Retorna os dados obtidos para a função de callback
            callback(null, rows);
        }
    });

    
  };
app.get('/cadastro',(req,res)=>{
    res.render('cadastro');
})