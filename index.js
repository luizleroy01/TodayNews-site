const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
var bodyParser = require ('body-parser')

const Posts = require('./posts.js')

const app = express()



//para garantir o uso do body-parser nas aplicações 
//para compreender os corpos de requisição em json e
//url-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//para conectar com o banco de dados do MongoDB
mongoose.connect('mongodb+srv://root:<password>@cluster0.lz3eeoc.mongodb.net/<database_name>?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true}).then(function(){
    console.log("Conectado com sucesso");
}).catch(function(err){
    console.log(err.message);
})


//configura a engine do express para renderizar arquivos html
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

//Essa linha diz que o diretório onde estão todos os conteúdos estáticos
//é no diretório public
app.use('/public',express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'/pages'));


//utilizando a query da requisição presente na url
//para verificar se é necessário buscar uma informação
//no banco de dados 
app.get('/',(req,res)=>{
    if(req.query.busca == null){
        //renderizar a página home
        Posts.find({}).sort({'_id':-1}).exec(function(err,posts){
            console.log(posts[0]);
            posts = posts.map(function(val){
                return{
                    titulo:val.titulo,
                    categoria:val.categoria,
                    descricaoCurta:val.Conteudo.substring(200,0),
                    conteudo:val.Conteudo,
                    imagem:val.imagem,
                    slug:val.slug,
                    autor:val.autor,
                    view:val.view
                }
                
            })
                    //lógica para pegar os 3 posts mais vistos do site
                    //usando o contador view presente em cada notícia
                    //assim é possível pegar da mais vista para a menos vista
                    Posts.find({}).sort({'view':-1}).limit(3).exec(function(err,postsTop){
                        //console.log(postsTop[0]);
                        postsTop = postsTop.map(function(val){
                            return{
                                titulo:val.titulo,
                                categoria:val.categoria,
                                descricaoCurta:val.Conteudo.substring(200,0),
                                conteudo:val.Conteudo,
                                imagem:val.imagem,
                                slug:val.slug,
                                autor:val.autor,
                                view:val.view
                            }
                            
                        })
                        //lógica para pegar os 3 posts mais vistos do site
                        
                        res.render('home',{posts:posts,postsTop:postsTop})
                    })
        })
        
    }else{
        Posts.find({titulo:{$regex:req.query.busca, $options:"i"}},function(err,posts){
            res.render('busca',{posts:posts,contagem:posts.length});
        })
    }
})

app.get('/:slug',(req,res)=>{
    // $inc :{views:1} é o contador para a quantidade de vsualizações em cada notícia
    //esse atributo é utilizado para rankear as mais lidas
    Posts.findOneAndUpdate({slug:req.params.slug},{$inc :{view:1}},{new:true},(err,resposta)=>{
        //console.log(resposta);
        if(resposta != null){
             //noticia é o "objeto" que contém a resposta, ou seja , todos os 
            //atributos contidos no banco de dados em que as mesmas 
            // são filtradas através do slug também no banco de dados
            Posts.find({}).sort({'view':-1}).limit(3).exec(function(err,postsTop){
                //console.log(postsTop[0]);
                postsTop = postsTop.map(function(val){
                    return{
                        titulo:val.titulo,
                        categoria:val.categoria,
                        descricaoCurta:val.Conteudo.substring(200,0),
                        conteudo:val.Conteudo,
                        imagem:val.imagem,
                        slug:val.slug,
                        autor:val.autor,
                        view:val.view
                    }
                    
                })
                //lógica para pegar os 3 posts mais vistos do site
                
                res.render('single',{noticia:resposta,postsTop:postsTop})
            })
        }else{
            res.redirect('/')
        }
        
    })
})
app.listen(3000,()=>{
    console.log('Servidor funcionando')
})