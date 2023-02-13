//organizando o esuqma de como será representado as informações de cada post
//que tem suas informações guardadas no banco de dados
var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var postSchema = new Schema({
    titulo:String,
    categoria:String,
    Conteudo:String,
    imagem:String,
    slug:String,
    autor:String,
    view: Number
},{collection:'posts'})

var Posts = mongoose.model("Posts",postSchema)

module.exports = Posts;
