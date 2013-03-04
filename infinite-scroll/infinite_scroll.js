YUI().use('node', 'event', 'io-base', function(Y){
    var updateInitiated;
    var page;
    var retries;
    var maxRetries;
    var allTweetsFetched;

    function init(){
        var self = this;
        //Initialize updateInitiated flag and pagination unit
        this.updateInitiated = false;
        this.page = 2;
        this.retries = 0;
        this.maxRetries = 3;
        this.allTweetsFetched = false;
        window.onscroll = handleScroll;
    }  

    function handleScroll(){
        var self = this;
        var scrollPos;
        if(this.updateInitiated){
            return;
        }   
        //Find the pageHeight and clientHeight(the no. of pixels to scroll to make the scrollbar reach max pos)
        var pageHeight = document.documentElement.scrollHeight;
        var clientHeight = document.documentElement.clientHeight;
        //Handle scroll position in case of IE differently
        if(Y.UA.ie){
            scrollPos = document.documentElement.scrollTop;
        }else{
            scrollPos = window.pageYOffset;
        }   
        //Check if scroll bar position is just 50px above the max, if yes, initiate an update
        if(pageHeight - (scrollPos + clientHeight) < 50 && this.retries < this.maxRetries && !this.allTweetsFetched){
            this.updateInitiated = true;
            var offset = Y.all(".stream-container .stream-items .stream-item").size();
            //Stop updating once 200 items are reached
            if(parseInt(offset, 10) >= 200){
                Y.one("#maxitems").setStyle('display', 'block'); 
                return;
            }   

            //Show loading gif
            Y.one("#loading-gif").setStyle("display", "block");
            document.documentElement.scrollTop += 60;
            
            var url = "http://ravikiranj.net/drupal/sites/all/hacks/infinite-scroll/infinite_scroll.php?page="+this.page;
            //var url = "http://localhost/infinite_scroll.php?page="+this.page;
            var oConn = Y.io(url, {
                on:{
                    success: function(id, o, args){
                        //Update pagination unit
                        args.self.page += 1;
                        args.self.retries = 0;
                        var resp = o.responseText;
                        var regex = "/No more tweets/";
                        if(!resp.match(regex)){
                            args.self.allTweetsFetched = true;
                            Y.one("#no_more_tweets").setStyle('display', 'block'); 
                        }else{
                            var list = Y.one(".stream-container .stream-items"); 
                            list.set('innerHTML', list.get('innerHTML')+resp);
                        }
                        Y.one("#loading-gif").setStyle("display", "none");
                    },  
                    failure: function(id, o, args){
                        args.self.retries += 1;
                        Y.one("#loading-gif").setStyle("display", "none");
                        alert('Failed to get data from Twitter :(');
                    },
                    complete: function(id, o, args){
                        args.self.updateInitiated = false;
                    }
                },  
                arguments: {
                    self: this
                }
            });
        }
    }
    init();
});
