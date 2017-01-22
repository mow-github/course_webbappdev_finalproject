/**
 * @author       Mats Wikmar, mow-github, matwik@gmail.com
 * @description
 *  1. Serves beer functionality with JS and JQuery (a mix)
 *  2. Serves data from Flickr API and BreweryDB API
 * */


/**
 *
 * @description
 *  set path to the API ( development / production )
 *
 * */
// const URL_PATH = "lernia/webbappdev"; // production path (use this when done)


/**
 * @description
 *  add custom functions to "DataType".prototype
 *
 * @purpose
 *  1. ReplaceAll
 *    1.1 Used to replace "space" with a "+"
 *    1.2 Thus one can send a valid query to the Flickr API
 *  2. shuffle
 *    2.1 Used to shuffle a array every x seconds ( see categories section )
 *
 * @param search      | String | etc. " "
 * @param replacement | String | etc. "+"
 *
 * @notes
 *  1. http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 *  2. http://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
 *
 * @improvements
 *  1. -
 * */
String.prototype.replaceAll = function(search, replacement) {
  let target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};
Array.prototype.shuffle = function() {
  let i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
    j = Math.floor( Math.random() * ( i + 1 ) );
    temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
  return this;
};


/**
 * @description
 *  a soft transition to another part of the page
 *
 * @purpose
 *  1. Build a "id" string based on the clicked element
 *  2. Use it as a argument in the animate function
 *
 * @notes
 *  1. The clicked element, can be: <li> <span> or <a>
 *
 * @improvements
 *  1. Build the "id"-string without any if-cond
 * */
$(".navbar li, .glyphicon-download,.navbar-brand").on("click",function(){

  let id = "#" + $(this).text().toLowerCase();        // set value if one clicks the navbar li
  if( id === "#" ){ id = "#categories"; }             // override value if one clicks the span icon
  if( $(this)[0].hash === "#home" ){ id = "#home"; }  // override value if one clicks the a-tag "home"

  $("html, body").animate({
    scrollTop: $( id ).offset().top
  }, 2000);
});


/**
 * @description
 *  1. a loader helper object to an ajax request (show/hide a modal with an rotating image)
 *
 * @notes
 *  1. start method: init a rot. on the image
 *  1. stop method:   end a rot. on the image (back to 0 and stop the interval)
 *
 * @improvements
 *  1. -

 * */
let globalAJAXLoaderObj = {

  intervalHolder: null,
  setIntervalInc: 0,
  modal: "#myModalLoader",
  modalImg: "#myModalLoaderImg",

  start: function(value){
    let _this = this;
    this.toggleModal(value);

    this.intervalHolder = setInterval( function(){
      $(_this.modalImg).css("transform", "rotate(" + (_this.setIntervalInc++) + "deg)");
    },100);
  },

  stop: function(value){
    this.toggleModal(value);
    clearInterval(this.intervalHolder);
    $(this.modalImg).css("transform", "rotate(" + (0) + "deg)");
  },

  toggleModal: function(value){
    $(this.modal).modal(value);
  }

};


/* chk when ajax start and finish */
$(document).on({

  ajaxStart: function(){
    console.log("loading ajax");
    globalAJAXLoaderObj.start("show");
  },
  ajaxStop: function() {
    console.log("loading ajax done");
    globalAJAXLoaderObj.stop("hide");
  }
});

/**
 * @description
 *  connecting to a BreweryDB API and output data in the DOM
 *  Example connection string: "http://api.brewerydb.com/v2/"+API_METHOD+"/?key="+API_KEY"
 *
 * @purpose
 *  1. send a AJAX request to BreweryDB API (fetching all categories)
 *   1.1 AJAX sends a POST string with etc. /categories (read API doc for more info)
 *  2. (a PHP file acts as a proxy..)
 *   2.1 reason1: hides the API key
 *   2.2 reason2: avoid CORS problem
 *   2.3 reason3: the API doesn't support JSONP and CORS
 *
 * @notes
 *  1. BreweryDB API has restriction.. read more on the web page (no JSONP support and limited access in the free version)
 *  2. http://stackoverflow.com/questions/32429776/how-to-process-external-api-json-and-not-jsonp
 *
 * @improvements
 *  1. Check if one can fetch all categories + images from BreweryDB API in one request
 *
 * */
let breweryAPIobj = {
  method: "POST",
  dataType: "JSON",
  url: "./api/brewery_api.php",
  brewery_categories: [],
  brewery_glass: [],
  selector: "#categories .row",
  stopInterval: null,
  fadeSpeed: 1000,
  intervalSpeed: 5000,

  getGlass: function(paramString){
    $.ajax({
      dataType: this.dataType,
      url: this.url,
      method: this.method,
      data : { paramString : paramString },
      success: ( response ) => {        /* changed from a arrow fn to a normal one*/
        console.log(response);

        /* changed from a for-of to for */
        for (let obj of response.data) {
          this.brewery_glass.push(obj.name);
        }
        createGlassSlider(this.brewery_glass);

      },
      error: ( response ) => {          /* changed from a arrow fn to a normal one*/
        console.log( response );
      }
    });
  },
  getBeer: function(paramString,cb){
    $.ajax({
      dataType: this.dataType,
      url: this.url,
      method: this.method,
      data : { paramString : paramString },
      success: ( response ) => {        /* changed from a arrow fn to a normal one*/
        cb(response.data); // Check Beeronality object
      },
      error: ( response ) => {          /* changed from a arrow fn to a normal one*/
        console.log( response );
      }
    });
  },
  getCategories: function(paramString){
    $.ajax({
      dataType: this.dataType,
      url: this.url,
      method: this.method,
      data : { paramString : paramString },
      success: ( response ) => {            /* changed from a arrow fn to a normal one*/
        clearInterval(this.loaderObj.stop);
        this.createCategories(response.data);
        this.init();
        this.activateMouseEvent();
      },
      error: ( response ) => {               /* changed from a arrow fn to a normal one*/
        console.log( response );
      }
    });
  },
  createCategories: (obj) => {                /* changed from a for-of to for*/
    for(let item of obj){
      if( item.name.length > 4 ){ this.brewery_categories.push(item.name.replaceAll("/","_")); }
    }
  },
  init: function(){
    $(this.selector).fadeOut(this.fadeSpeed, () => {
      $(this.selector).empty();
      breweryAPIobj.brewery_categories.shuffle();

      let frag = document.createDocumentFragment();
      for (let category of breweryAPIobj.brewery_categories) {

        let div = document.createElement("div");
        div.className = "col-xs-12 col-sm-6 col-md-4 col-lg-3";
        let a = document.createElement("a");
        a.href = "#";
        a.className = "thumbnail";
        div.appendChild(a);
        let img = document.createElement("img");
        img.src = "img/categories/" + category + ".jpg";
        img.alt = category;
        a.appendChild(img);
        let span = document.createElement("span");
        span.textContent = category;
        span.setAttribute("data-toggle","modal");
        span.setAttribute("data-target","#myModal");
        a.appendChild(span);
        frag.appendChild(div);
      }
      $(this.selector).fadeIn(this.fadeSpeed).append(frag);
    });
  },
  playCategories: function(){
    this.stopInterval = setInterval(()=>{
      this.init();
    },this.intervalSpeed);
  },
  activateMouseEvent: function (){
    $(document).on("mouseover",this.selector,()=>{
      clearInterval(this.stopInterval);
    });
    $(document).on("click",".thumbnail",function(e){
      e.preventDefault();
      clearInterval(this.stopInterval);
      $(this).find("span").show();
    });
    $(document).on("mouseout",this.selector,()=>{
      this.playCategories();
    });
    $(document).on("click",".thumbnail>span",function(e){
      e.preventDefault();
      e.stopPropagation(); // stop parent from exec
      let query = $(this).text();
      flickrAPIobj.getImages(query);
    });
  },
  loader: function(){
    let pBar = document.createElement("img");
    pBar.setAttribute("src","img/beer.png");
    pBar.id = "progress";
    pBar.setAttribute("style","transform: rotate(0deg)");
    $(this.selector).append(pBar);

    this.loaderObj.stop = setInterval(() => {
      let angle = Number( pBar.getAttribute("style").split("(")[1].split("deg)")[0] );
      pBar.setAttribute("style","transform: rotate("+(angle+1+this.loaderObj.incFactor)+"deg)");
    },100);
  },
  loaderObj: {
    incFactor: 5,
    stop: null,

  },
};
breweryAPIobj.getGlass("/glassware");
breweryAPIobj.loader();
breweryAPIobj.getCategories("/categories");

/**
 * @description
 *  Custom image slider with prev / next btns + info text
 *
 * @purpose
 *  1. create the slider based on the "/glassware"-query from the BreweryDB API
 *
 * @notes
 *  1. breweryAPIobj fetches the glass names and pushes it into an array
 *    (createGlassSlider func. creates this slider based on that value )
 *
 * @improvements
 *  1. Timer functionality with a progress bar
 *  2. BreweryDB API may support image src in the future
 *  3. move this function "createGlassSlider" inside BreweryObj
 *
 * */
function createGlassSlider(brewery_glass){
  const GLASS_PATH = "./img/glass/";
  const GLASS_EXT  = ".jpg";
  $(".glassContainer > img.on").attr("src",GLASS_PATH+brewery_glass[0]+GLASS_EXT);
  $(".glassContainer > span.info").text(brewery_glass[0]+" (1/"+brewery_glass.length+")");

  $(document).on("click",".glassContainer > span:not(.info)",function(){

    let direction       = $(this).attr("data-custom-direction");
    let imgSelector     = $(".glassContainer > img.on");
    let prevSelector    = $(".glassContainer > span.glyphicon-arrow-left");
    let nextSelector    = $(".glassContainer > span.glyphicon-arrow-right");
    let infoSelector    = $(".glassContainer > span.info");
    let fullPathCurrImg = imgSelector.attr("src");
    let noPathCurrImg   = fullPathCurrImg.split("/").pop().split(".")[0];
    let nr              = brewery_glass.indexOf( noPathCurrImg );

    direction === "next" ? nr += 1 : direction === "prev" ? nr -= 1 : nr += 0;

    nr === brewery_glass.length-1 ? nextSelector.hide() : nextSelector.show();
    nr === 0                      ? prevSelector.hide() : prevSelector.show();

    imgSelector.attr("src",GLASS_PATH+brewery_glass[nr]+GLASS_EXT);
    infoSelector.text(brewery_glass[nr]+" ("+(nr+1)+"/"+brewery_glass.length+")");
  });
}


/**
 * @description
 *  fetch data from FLICKR API based on the queryString
 *
 * @purpose
 *  1. One clicks on the category-text (categories images)
 *  2. AJAX request to FLICKR API (PHP acts as a proxy.. hide key.. and avoid CORS problem)
 *  3. The "queryString" is the clicked category-text
 *  4. A function builds the complete img-path based on the response object. ( farm, server, id, secret )
 *  5. loop content to the DOM
 *
 * https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=API_KEY&text=beer&per_page=10&page=1&format=json&nojsoncallback=1
 *
 * @notes
 *  1. FLICKR query example format:
 *    1.1 FLICKR_URL+"method="+FLICKR_METHOD+"&api_key="+API_KEY+"&text="+$FLICKR_TEXT+"&per_page="+FLICKR_PERPAGE+"&page="+FLICKR_PAGE+"&format=json&nojsoncallback=1'
 *      1.1.1 FLICKR_URL:     https://api.flickr.com/services/rest/?
 *      1.1.2 FLICKR_METHOD:  flickr.photos.search
 *      1.1.3 API_KEY:        "your unique key from flickr"
 *      1.1.4 FLICKR_TEXT:    beer
 *      1.1.5 FLICKR_PERPAGE: 10
 *      1.1.6 FLICKR_PAGE:    1
 *
 *  2.  The queryString is fixed before the AJAX request (etc. "one two three" eq "one+two+three")
 *
 *  3. added a getImagesNoProxy method (client side FLICKR api request)
 *    3.1 Remember to enter your API_KEY inside the method
 *
 * @improvements
 *  1. Fetch more accurate images based on the query
 *
 * */
let flickrAPIobj = {
  getImages: function (queryString){
    $.ajax({
      dataType: "json",
      url: "./api/flickr_api.php",
      method: "POST",
      data : { paramString : queryString.replaceAll(" ","+") },
      success: ( response ) => {
        console.log( response );
        this.buildImgPathAndAppend(response.photos.photo);
      },
      error: ( response ) => {
        console.log( response );
      }
    });
  },/**/
  getImagesNoProxy: function (queryString){

    const FLICKR_BASE_URL = "https://api.flickr.com/services/rest/?";
    const FLICKR_METHOD   = "flickr.photos.search";
    const API_KEY         = ""; //your api key
    const FLICKR_TEXT     = queryString.replaceAll(" ","+");
    const FLICKR_PERPAGE  = 30;
    const FLICKR_PAGE     = 1;

    $.ajax({
      dataType: "json",
      url: FLICKR_BASE_URL+"method="+FLICKR_METHOD+"&api_key="+API_KEY+"&text="+FLICKR_TEXT+"&per_page="+FLICKR_PERPAGE+"&page="+FLICKR_PAGE+"&format=json&nojsoncallback=1",
      method: "POST",
      success: ( response ) => {
        console.log( response );
        this.buildImgPathAndAppend(response.photos.photo);
      },
      error: ( response ) => {
        console.log( response );
      }
    });
  },
  buildImgPathAndAppend: function(obj){
    let selector = $("#myModalBody");
    selector.empty();
    for(let item of obj){
      let img = document.createElement("img");
      img.src = "https://farm"+item.farm+".staticflickr.com/"+item.server+"/"+item.id+"_"+item.secret+".jpg";
      img.height = 150;
      img.width = 150;
      selector.append(img);
    }
  }
};
//flickrAPIobj.getImagesNoProxy("cider beer");

/**
 * @description
 *  fetch data from a JSON file (quotes)
 *
 * @purpose
 *  1. fadeToggle quotes in a static blockquote holder based on the speed object
 *
 * @notes
 *  1. intervalSpeed should be at least ~sec. higher than the fadeSpeed
 *
 * @improvements
 *  1. filter jsonResponse data
 *  2. create a dyn. blockquote holder and add it to random places in the DOM
 *  3. create a quote slider with images
 *
 * */
let quoteObj = {
  selector: $("#quoteContainer"),
  speed: { fadeSpeed: 2000, intervalSpeed: 8000 },
  jsonObj: null,
  url: "./api/dataQuotes.json",
  quoteNumberHolder: null,

  getQuotes: function (){
    $.ajax({
      dataType: "json",
      url: this.url,
      method: "POST",
      success: ( response ) => {
        this.jsonObj = response;
        this.addQuoteToDOM();
      },
      error: ( response ) => {
        console.log( response );
      }
    });
  },
  addQuoteToDOM: function(){
    this.switchQuote();
    setInterval(() => {
      this.selector.fadeOut(this.speed.fadeSpeed,() => {
        this.switchQuote();
        this.selector.fadeIn(this.speed.fadeSpeed);
      });
    },this.speed.intervalSpeed);
  },
  switchQuote: function(){
    let randomNumber = Math.floor(Math.random()*this.jsonObj.length);
    if( this.quoteNumberHolder === randomNumber ){
      return this.switchQuote();
    }
    this.quoteNumberHolder = randomNumber;

    let item = this.jsonObj[randomNumber];
    this.selector.removeClass().toggleClass(item.className);
    this.selector.children("p").text(item.text);
    this.selector.children("footer").text(item.author + item.location);
  }

};
quoteObj.getQuotes();













let questionObj = [
  {
    "question": "How many beers do you take during the evening ?",
    "answear0": "One",
    "answear1": "Two",
    "answear2": "Three",
    "answear3": "Four",
  },
  {
    "question": "You meet your friend after work, he/she is thirsty and has no beer.. what do you do ?",
    "answear0": "I make big eyes and hurriedly open my jacket and reach for a cold beer from my inside pocket. No one goes thirsty in my company.",
    "answear1": "I understand his / hers dilemma, we go to the local bar",
    "answear2": "I laugh at him / her as I take a sip from my beer",
    "answear3": "I pray that the sickness doesn't spread to other people, how can one go around without a beer ?",
  },
  {
    "question": "You see two people arguing when you are walking in the park, what do you do ?",
    "answear0": "I sit down at the nearest park bench and enjoy the show with a cold beer",
    "answear1": "I rush to them, and put a cold beer in their hands..no wonder that they are arguing !",
    "answear2": "I yell for help, and continue drinking",
    "answear3": "I continue walking unbothered by the event, I have my beer",
  },
];



/**
 * @description
 *  Answer questions and get a beer based on your total points
 *
 * @purpose
 *  1. Create a question based on the JSON questionObj ( iterate throu the object when one clicks a answer )
 *  2. Fetch a beer from the BreweryDB API at the end (based on your total point) and add it to the DOM
 *
 * @notes
 *  1. It fetches a random beer atm
 *
 * @improvements
 *  1. Make a if cond.. fetch beer with id x based on the total points
 *
 * */
let BeeronalityObj = {
  labelSelector:    "#beeronality form > div label",
  inpSelector:      "#beeronality form > div input[type='radio']",
  inpTextSelector:  "#beeronality form > div input[type='radio'] + div",
  total: 0,
  counter: 0,
  init: function(){

    this.generateQuestion( this.counter );

    $(document).on("click",this.inpSelector,(e) => {

      this.counter += 1;
      this.total   += Number( $(e.target).val() );

      if( questionObj.length === this.counter ){
        return this.endQuestion();
      }

      this.generateQuestion( this.counter );

    });
  },
  generateQuestion: function(nr){
    $(this.labelSelector).text( questionObj[nr].question );
    $(this.inpTextSelector).each(function(key){
      $(this).text( questionObj[nr]["answear"+[key]] );
    });
  },
  endQuestion: function(){
    console.log("end");
    console.log("You got "+this.total+" points");

    breweryAPIobj.getBeer("/beer/random",function(obj){
      console.log(obj);

      $("#beeronality").empty();
      $("#beeronality").append("<h4>"+obj.name+"</h4>");

      if(obj.description){
        $("#beeronality").append("<div>"+obj.description+"</div>");
      }
      if( obj.labels ){
        let img         = document.createElement("img");
        img.src         = obj.labels.medium;
        img.className   = "img-responsive";
        $("#beeronality").append(img);
      }
      if( obj.glasswareId ){
        $("#beeronality").append("<div>Serve with this glass: "+breweryAPIobj.brewery_glass[obj.glasswareId]+"</div>");
        let img         = document.createElement("img");
        img.src         = "./img/glass/"+breweryAPIobj.brewery_glass[obj.glasswareId]+".jpg";
        img.className   = "img-responsive";
        $("#beeronality").append(img);
      }
    });

  }

};
BeeronalityObj.init();














