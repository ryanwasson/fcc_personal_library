/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
var mongoose = require('mongoose');
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
mongoose.connect(MONGODB_CONNECTION_STRING);

//define schema
let bookSchema = mongoose.Schema({
  title: String,
  commentcount: Number,
  comments: [String]
}); 

let Book = mongoose.model('Book',bookSchema,'Books');

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({},function(err,books) {
        if (err) return res.json({error: 'could not GET books due to following error: ' + err}) ;
        else return res.json(books.map(book => ({_id: book._id,
                                                title: book.title,
                                                commentcount: book.commentcount
                                                }))) ;
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
    
      if (title == '' || title == undefined) return res.json({error: 'could not POST because title is missing'});
    
      var newBook = new Book({title: title, commentcount: 0, comments: []}) ;
      newBook.save(function(err,book) {
        if (err) return res.json({error: 'could not save new book due to the following error: ' + err}) ;
        else return res.json({title: book.title,
                              _id: book._id
                             });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.remove({},function(err,data){
        if (err) return res.json({error: 'could not delete all books in the database due to following error: ' + err});
        else return res.json({success: 'complete delete successful'}) ;
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid,function(err,book) {
        if (err) return res.json({error: 'no book exists'});
        else {
          return res.json({_id: bookid,
                              title: book.title,
                              comments: book.comments
                             });
        }
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      Book.findById(bookid,function(err,book) {
        if (err) return res.json({error: 'could not POST book with id = ' + bookid + ' due to the following error: ' + err}) ;
        else {
          //using concat instead of push since $pushall is deprecated
          book.comments = book.comments.concat([comment]) ;
          book.commentcount++ ;
          book.save(function(err,book) {
            if (err) return res.json({error: 'could not POST book with id = ' + bookid + ' due to the following error: ' + err}) ;
            else return res.json({_id: bookid,
                              title: book.title,
                              comments: book.comments
                             });
          });
        }
      });
                    
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.remove({_id: bookid},function(err,data){
        if (err) return res.json({error: 'could not delete book with id = ' + bookid + ' due to following error: ' + err});
        else return res.json({success: 'delete successful'}) ;
      });
    });
  
};
