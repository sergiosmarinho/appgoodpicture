    var imagemAtual;
    var pictureSource;
    var localEscolhido=null;
    var naoPodeEscreverlocation = null;//parece que location é palavra reservada
    var fotos=[];
    var giroLiberado=true;
    var sliderTravado=false;

    window.addEventListener('deviceorientation', handleOrientation);//pega a angulação do dispositivo, não portrait e landiscape...
    function handleOrientation(event) {
      if(sliderTravado==false){
        if(giroLiberado==false){
          return;
        }
        giroLiberado=false;
        var y = event.gamma;
        //alert(y);
        if(y>55){//se o angulo feito é maior de 55 graus
          //alert(y + " giro para direita");
          setTimeout(function(){fotoProxima();},500);
          setTimeout(function(){ giroLiberado=true; }, 2000);
        }else if(y<-55){//se o angulo feito é maior que 55 graus para o outro lado, sentido antihorario
          //alert(y+" giro para esquerda");
          setTimeout(function(){fotoAnterior();},500);
          setTimeout(function(){ giroLiberado=true; }, 2000);
        }else{
          setTimeout(function(){ giroLiberado=true; }, 800);
        }
      }
    }

    window.onerror = function(message, url, lineNumber) {
        alert("Error: "+message+" in "+url+" at line "+lineNumber);// print dos erros
    }

    /*function leAceleracao(acceleration) {
      if(sliderTravado==false){
        if(giroLiberado==false){
          return;
        }
        giroLiberado=false;
        var y = event.gamma;
        //alert(y);
        if(acceleration.y>55){//se o angulo feito é maior de 55 graus
          //alert(y + " giro para direita");
          setTimeout(function(){fotoProxima();},500);
          setTimeout(function(){ giroLiberado=true; }, 2000);
        }else if(acceleration.y<-55){//se o angulo feito é maior que 55 graus para o outro lado, sentido antihorario
          //alert(y+" giro para esquerda");
          setTimeout(function(){fotoAnterior();},500);
          setTimeout(function(){ giroLiberado=true; }, 2000);
        }else{
          setTimeout(function(){ giroLiberado=true; }, 800);
        }
      }
    }

    function erroAceleracao() {
        
    }*/

    document.addEventListener("deviceready",onDeviceReady,false);
    
    function onDeviceReady() {
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
        atualizaGPS();
        //var opcoesAcel = { frequency: 3000 };
        //navigator.accelerometer.watchAcceleration(leAceleracao, erroAceleracao, opcoesAcel);
    }
    
    function tirarFotoCamera() {
      navigator.camera.getPicture(sucessoCamera, erroCamera, { quality: 100, destinationType:0, correctOrientation:true, targetWidth:500, targetWidth:500, allowEdit:true, mediaType:0 });
    }

    function erroCamera(message) {
    }

    function sucessoCamera(imageData) {       
      var imagemDOM = document.getElementById('fotoTirada');
      imagemDOM.style.display = 'block';
      imagemAtual = "data:image/jpeg;base64,"+imageData;
      fotos.push(imagemAtual);
      imagemDOM.src = imagemAtual;      
    }

    function salvarFotoAtual(){
      var fotinhadosrc = document.getElementById("fotoTirada").src;
      if(fotinhadosrc.indexOf("data:image/jpeg;base64,") === -1){
        alertaErro("Tire uma foto!","Você precisa tirar uma foto para poder salvar");
        return;
      }
      var myBase64 = fotinhadosrc.replace("data:image/jpeg;base64,","");
      var contentType = "image/jpeg";
      var folderpath = "file:///storage/emulated/0/Download";
      var filename = criaNomeFoto()+".jpeg";
      savebase64AsImageFile(folderpath,filename,myBase64,contentType);
    }

    function efeitoMono(){
      var imagemDOM = document.getElementById('fotoTirada');
      var currentImage = new Image();
        currentImage.src = imagemAtual;
        filterous.importImage(currentImage, null)
        .applyInstaFilter("Willow")
        .renderHtml(imagemDOM);
    }

    function efeitoSepia(){
      var imagemDOM = document.getElementById('fotoTirada');
      var currentImage = new Image();
        currentImage.src = imagemAtual;
        filterous.importImage(currentImage, null)
        .applyFilter('sepia', 0.9)
        .renderHtml(imagemDOM);
    }

    function efeitoNormal(){
      var imagemDOM = document.getElementById('fotoTirada');
      var currentImage = new Image();
        currentImage.src = imagemAtual;
        filterous.importImage(currentImage, null)
        .applyInstaFilter("Normal")
        .renderHtml(imagemDOM);
    }

    function compartilhar(){
      var fotinhadosrc = document.getElementById("fotoTirada").src;
      window.plugins.socialsharing.shareViaTwitter("Em "+localEscolhido, fotinhadosrc, null);
    }

    function getTextolocal(opt){        
      swal({
        title: 'Onde você está?',
        input: 'select',
        inputOptions: opt,
        inputPlaceholder: 'Selecione um lugar próximo',
        showCancelButton: false,
      }).then(function (valorNovo) {
        localEscolhido=valorNovo.value;
        if(valorNovo.value==null){
          alertaErro("Erro","Nenhum local foi selecionado!");
        }
        else if(valorNovo.value.trim()==""){
          alertaErro("Erro","Nenhum local foi selecionado!");
        }
        else{
          compartilhar();
        }
      });  
    }

    function alertaErro(titulo,mensagem){
    swal({
        title: titulo,
        text: mensagem,
        type: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok!'
        });
}

function getLocaisProximos(){
  var fotinhadosrc = document.getElementById("fotoTirada").src;
  if(fotinhadosrc.indexOf("data:image/jpeg;base64,") === -1){
    alertaErro("Tire uma foto!","Você precisa tirar uma foto para poder compartilhar");
    return;
  }  

  var endereco = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
  var radius = "100";
  var key = "";//aqui se coloca a chave para usar a api
  var retorno;  
  var endConsulta = endereco+"&"+"location="+naoPodeEscreverlocation+"&"+"radius="+radius+"&"+"key="+key;
    
    $.ajax({
      dataType: "json",
      url: endConsulta,
      async: false,
      success: function(d){
        var res = d.results;
        var i =0;
        var opts='{"Não Informado":"Não Informar"';
        if(res.length>0){
          opts+=",";
        }
        while(i<res.length){
          opts+= '"'+res[i].name+'"'+":"+'"'+res[i].name+'"';
          if(i+1<res.length){
            opts+=",";
          }
          i++;
        } 
        opts+="}";
        retorno = opts; 
      }
    });
    var x =JSON.parse(retorno);
    getTextolocal(x);
}        

function erroGPS(){
  Alert("Erro GPS");
}

function atualizaGPS(){
  navigator.geolocation.getCurrentPosition(function(position){
    naoPodeEscreverlocation=position.coords.latitude+","+position.coords.longitude;
  }, erroGPS, null);
  setTimeout(atualizaGPS, 30*000);
}

function fotoProxima(){
  if(fotos.length<=0){
    return;
  }
  var i=0;
  while(i<fotos.length){
    if(fotos[i]===imagemAtual){
      break;
    }
    i++;
  }
  if(i+1>=fotos.length){//garantir uma circularidade
    imagemAtual=fotos[0];
    var imagemDOM = document.getElementById('fotoTirada');
    imagemDOM.src = imagemAtual;
  }else{
    imagemAtual=fotos[i+1];
    var imagemDOM = document.getElementById('fotoTirada');
    imagemDOM.src = imagemAtual;
  }
}

function fotoAnterior(){
  if(fotos.length<=0){
    return;
  }
  var i=0;
  while(i<fotos.length){
    if(fotos[i]===imagemAtual){
      break;
    }
    i++;
  }
  if(i<=0){//garantir uma circularidade
    imagemAtual=fotos[fotos.length-1];
    var imagemDOM = document.getElementById('fotoTirada');
    imagemDOM.src = imagemAtual;
  }else{
    imagemAtual=fotos[i-1];
    var imagemDOM = document.getElementById('fotoTirada');
    imagemDOM.src = imagemAtual;
  }
}

function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
}

function savebase64AsImageFile(folderpath,filename,content,contentType){
    var DataBlob = b64toBlob(content,contentType);
    window.resolveLocalFileSystemURL(folderpath, function(dir) {
        //conseguiu acesso
    dir.getFile(filename, {create:true}, function(file) {
            //rolou
            file.createWriter(function(fileWriter) {
                //escrevendo
                fileWriter.write(DataBlob);
            }, function(){
              //erro
            });
    });
    });
    alertaSucesso("Sucesso","Foto salva com sucesso!");
}

function criaNomeFoto() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  var d = new Date();
  var n = d.getTime();
  n = n+"";

  return text+n;
}

function alertaSucesso(titulo,mensagem){
swal({
  title: titulo,
  text: mensagem,
  type: 'success',
  confirmButtonColor: '#3085d6',
  confirmButtonText: 'Ok'
  });
}

function clickBotaoTrava(){
  var domzim = document.getElementById("bloquearbtn");
  if(sliderTravado){
    sliderTravado=false;
    domzim.src="img/open.png";
    //alert("abriu");
  }else{
    sliderTravado=true;
    domzim.src="img/lock.png";
    //alert("travou");
  }
}