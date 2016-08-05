var app = angular.module('contactBox', ['ui.router','ngAnimate','anim-in-out','ngStorage','ngImgCrop']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('list', {
      url: '/',
      templateUrl: 'templates/list.html'
    })
    .state('contact', {
      url: '/contact/',
      params: {
        id: null
      },
      templateUrl: 'templates/contact.html',
      controller : 'ContactCtrl'
    })
    .state('add', {
      url: '/add',
      templateUrl: 'templates/add.html',
      controller : 'AddEditCtrl'
    })
    .state('edit', {
      url: '/edit',
      templateUrl: 'templates/edit.html',
      controller : 'AddEditCtrl',
      params: {
        id: null
      },
    });
    $urlRouterProvider.otherwise('/');
}]);

/* --- MAIN PAGE CONTROLLER --- */
app.controller('MainCtrl', function($http, $state, $localStorage, $scope, $timeout, ContactsData){

  $scope.contacts = ContactsData;

  $scope.search = {};
  $scope.search.showBar = function(){
    $('.header-bar-content').addClass('header-bar-content-hidden');
    $timeout(function(){
      $('.header-bar-search').addClass('header-bar-search-active').find('input').focus();
    },100);
  }
  $scope.search.hideBar = function(){
    $('.header-bar-search').removeClass('header-bar-search-active');
    $timeout(function(){
      $('.header-bar-content').removeClass('header-bar-content-hidden');
    },100);
  }
  $scope.$on('hideSearch', function() {
    $scope.search.hideBar();
  });

  $scope.search.query = null;
  $scope.search.run = function(item){
      if (
        !$scope.search.query
        || (item.fname.toLowerCase().indexOf($scope.search.query.toLowerCase()) > -1)
        || (item.lname.toLowerCase().indexOf($scope.search.query.toLowerCase()) > -1)
        || (item.company.toLowerCase().indexOf($scope.search.query.toLowerCase()) > -1)
        //|| (item.phone.toLowerCase().indexOf($scope.search.query.toLowerCase()) > -1)
        //|| (item.email.toLowerCase().indexOf($scope.search.query.toLowerCase()) > -1)
      ){
          return true;
      }
      return false;
  };

  $scope.loadContact = function(contact){
      $state.go('contact',{id:contact.id});
  }

  $scope.$state = $state;
  $scope.$watch('$state', function(newValue, oldValue) {
    $scope.$state = newValue;
  });

  // --- broadcast navbar events to other controllers
  $scope.addContact = function(){
    $scope.$broadcast("addContact");
  }
  $scope.editContact = function(){
    $scope.$broadcast("editContact");
  }
  $scope.editBack = function(){
    $scope.$broadcast("editBack");
  }
  $scope.deletePopup = function(){
    $scope.$broadcast("deletePopup");
  }
});

/* --- CONTACT PAGE CONTROLLER --- */
app.controller('ContactCtrl', function($state, $stateParams, $scope, $localStorage, $timeout, ContactsData){
  $scope.$emit('hideSearch');
  //console.log($stateParams);
  if($stateParams.id === null){
    if ($localStorage.currentContact === null || $localStorage.currentContact === "undefined"){
        $state.go('list');
    }
    else {
      //console.log(ContactsData);
      var contact = $.grep(ContactsData, function(e){ return e.id == $localStorage.currentContact; });
      $scope.contact = contact[0];
    }
  }
  else {
    $localStorage.currentContact = $stateParams.id;
  }

  var contact = $.grep(ContactsData, function(e){ return e.id == $localStorage.currentContact; });
  $scope.contact = contact[0];

  $scope.cleanPhone = $scope.contact.phone.replace(/[^0-9.]/g,'');

  $scope.$on("editContact", function(){
    $state.go('edit',{id:$scope.contact.id});
  });

  $scope.$on("deletePopup", function(){
    $('.contact-validation-shadowbox').css({"display":"table","opacity":"0"}).animate({"opacity":"1"},300);
  });
  $scope.cancelPopup = function(){
    $('.contact-validation-shadowbox').fadeOut(300);
  }
  $scope.deleteContact = function(){
    //var index = ContactsData.findIndex(x => x.id == $scope.contact.id);
    var index = ContactsData.findIndex(function(x){
      if(x.id == $scope.contact.id){
        return x;
      }
    });
    console.log(index);
    ContactsData.splice(index,1);
    $state.go('list');
  }
});

/* --- ADD & EDIT PAGE CONTROLLER --- */
app.controller('AddEditCtrl', function($state, $stateParams, $scope, $localStorage, $timeout, ContactsData){
  $scope.$emit('hideSearch');

  // --- edit page only logic
  if($state.includes('edit')){
    if($stateParams.id === null){
      if ($localStorage.currentContact === null || $localStorage.currentContact === "undefined"){
          $state.go('list');
      }
      else {
        var contact = $.grep(ContactsData, function(e){ return e.id == $localStorage.currentContact; });
        $scope.contact = contact[0];
      }
    }
    else {
      $localStorage.currentContact = $stateParams.id;
      var contact = $.grep(ContactsData, function(e){ return e.id == $localStorage.currentContact; });
      $scope.contact = contact[0];
    }

    $scope.contact.fullName = $scope.contact.fname + " " + $scope.contact.lname;

    $scope.$on("editBack", function(){
      $state.go('contact',{id:$scope.contact.id});
    });

    //console.log($scope.contact.id, $localStorage.currentContact);
  }

  // --- add page only logic
  if($state.includes('add')){
    $scope.contact = {};
    $scope.contact.fullName = "";
    $scope.contact.fname = "";
    $scope.contact.lname = "";
    $scope.contact.company = "";
    $scope.contact.email = "";
    $scope.contact.phone = "";
    $scope.contact.photo = "";

    var maxId = 0;
    for(i=0;i<ContactsData.length;i++){
      if(ContactsData[i].id > maxId){
        maxId = ContactsData[i].id;
      }
    }
    //$scope.contact.id = ContactsData.length;
    $scope.contact.id = maxId + 1;
    $localStorage.currentContact = $scope.contact.id;
  }

  //console.log($scope.contact.id);

  // --- logic for both edit and add pages
  $('input[name="add_name"]').focus();

  $scope.myImage='';
  $scope.myCroppedImage='';

  var handleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        $scope.myImage=evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };
  angular.element(document.querySelector('#add-photo-btn')).on('change',handleFileSelect);

  $scope.cropped = false;
  $scope.showCropper = function(){
    $('.contact-image-crop').css("z-index","11");
    $('.edit-avatar-default').css("display","none");
    $('.edit-avatar-new').css("display","inline-block");
  }
  $scope.hideCropper = function(){
    $scope.cropped = true;
    $('.contact-image-crop').css("z-index","0");
  }

  $scope.$on("addContact", function(){
    var nameArr =$scope.contact.fullName.split(" ");
    if(nameArr.length < 2){
      $('.contact-validation-shadowbox').css({"display":"table","opacity":"0"}).animate({"opacity":"1"},300);
    }
    else {
      $scope.contact.fname = nameArr.slice(0,nameArr.length - 1).join(" ");
      $scope.contact.lname = nameArr[nameArr.length - 1];
      if($scope.cropped){
        $scope.contact.photo = $scope.myCroppedImage;
      }
      else {
        $scope.contact.photo = $scope.contact.photo;
      }


      //console.log($scope.contact.id);
      var index = ContactsData.findIndex(function(x){
        if(x.id == $scope.contact.id){
          return x;
        }
      });
      //console.log(ContactsData);
      //console.log(index)
      if(index > -1){
        ContactsData[index] = $scope.contact;
      }
      else {
        ContactsData.push($scope.contact);
      }
      //ContactsData.push($scope.contact);
      $state.go('list');
    }
  });

  $scope.dismissPopup = function(){
    $('.contact-validation-shadowbox').fadeOut(300);
  }
});


/* --- CONTACTS DATA MANAGEMENT --- */
app.factory('ContactsData',function($localStorage,$sessionStorage){
  if(typeof $localStorage.contacts == "undefined"){
    var contacts = [
    	{
        "id": 0,
    		"fname": "Yen",
    		"lname": "Walsh",
    		"company": "Tellus Incorporated",
    		"phone": "(265) 560-8376",
    		"email": "Mauris.magna.Duis@convallis.net",
    		"photo": "img/placeholder_female_1.png"
    	},
    	{
        "id": 1,
    		"fname": "Tana",
    		"lname": "Cantu",
    		"company": "Duis At Lacus Inc.",
    		"phone": "(855) 234-0506",
    		"email": "nec.ante@Suspendisse.co.uk",
    		"photo": "img/placeholder_female_3.png"
    	},
    	{
        "id": 2,
    		"fname": "Aubrey",
    		"lname": "Oneil",
    		"company": "Posuere Enim Nisl Institute",
    		"phone": "(193) 708-2341",
    		"email": "Sed.nunc@rutrum.ca",
    		"photo": "img/placeholder_female_1.png"
    	},
    	{
        "id": 3,
    		"fname": "Astra",
    		"lname": "Daugherty",
    		"company": "Gravida Molestie Arcu Institute",
    		"phone": "(836) 604-8333",
    		"email": "volutpat.Nulla@nislNullaeu.net",
    		"photo": "img/placeholder_female_3.png"
    	},
    	{
        "id": 4,
    		"fname": "Cruz",
    		"lname": "Mcdonald",
    		"company": "Augue Sed Ltd",
    		"phone": "(747) 310-9819",
    		"email": "nec.mauris.blandit@sedturpis.net",
    		"photo": "img/placeholder_male_3.png"
    	},
    	{
        "id": 5,
    		"fname": "Zachery",
    		"lname": "Anderson",
    		"company": "Auctor Vitae Aliquet LLC",
    		"phone": "(742) 402-5105",
    		"email": "a.auctor.non@dolor.edu",
    		"photo": "img/placeholder_male_2.png"
    	},
    	{
        "id": 6,
    		"fname": "Dexter",
    		"lname": "Acevedo",
    		"company": "Adipiscing Fringilla PC",
    		"phone": "(276) 793-6500",
    		"email": "massa.lobortis.ultrices@atortor.ca",
    		"photo": "img/placeholder_male_2.png"
    	},
    	{
        "id": 7,
    		"fname": "Signe",
    		"lname": "Lester",
    		"company": "Est Ac Facilisis Incorporated",
    		"phone": "(828) 298-8543",
    		"email": "felis@euismodenim.ca",
    		"photo": "img/placeholder_male_3.png"
    	},
    	{
        "id": 8,
    		"fname": "Driscoll",
    		"lname": "Gilbert",
    		"company": "Elit Corp.",
    		"phone": "(163) 569-6124",
    		"email": "semper.dui@pellentesque.com",
    		"photo": "img/placeholder_male_1.png"
    	},
    	{
        "id": 9,
    		"fname": "Miriam",
    		"lname": "Everett",
    		"company": "Orci Ltd",
    		"phone": "(140) 567-3077",
    		"email": "Nulla.facilisi.Sed@ipsumCurabiturconsequat.ca",
    		"photo": "img/placeholder_female_2.png"
    	}
    ];

    $localStorage.contacts = contacts;
  }
  else {
    var contacts = $localStorage.contacts;
  }

  return contacts;
});
