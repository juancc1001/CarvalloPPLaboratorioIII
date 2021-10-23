window.addEventListener("load", CargarElementos);
var listaLocalidades;

function $(id)
{
    return document.getElementById(id);
}

function CargarElementos() 
{
    let promisePersona = new Promise(ObtenerPersonas);
    promisePersona.then(CargarFilas).catch(ErrorF);
    let promiseLocalidades = new Promise(ObtenerLocalidades);
    promiseLocalidades.then(CargarLocalidades).catch(ErrorF);

    $("btnCerrarForm").addEventListener("click", CerrarForm);
}

function ObtenerPersonas(resolve, reject)
{
    var request = new XMLHttpRequest();
    request.onreadystatechange = function()
    {
        if(this.status == 200 && this.readyState==4)
        {
            var lista = new Array(JSON.parse(this.responseText));
            resolve(lista);
            $("divSpinner").hidden = true;
        }else if(this.status == 404 && this.readyState != 4)
        {
            reject();
            $("divSpinner").hidden = true;
        }
    }

    request.open("GET", "http://localhost:3000/personas");
    request.send();
    $("divSpinner").hidden = false;
}

function CargarFilas(lista)
{
    var tabla = $("table");
    for (let i = 0; i < lista[0].length; i++)
    {
        let fila = document.createElement("tr");

        let cId = document.createElement("td");
        let cNombre = document.createElement("td");
        let cApellido = document.createElement("td");
        let cLocalidad = document.createElement("td");
        let cSexo = document.createElement("td");

        let tId = document.createTextNode(lista[0][i].id);
        let tNombre = document.createTextNode(lista[0][i].nombre);
        let tApellido = document.createTextNode(lista[0][i].apellido);
        let tLocalidad = document.createTextNode(lista[0][i].localidad.nombre);
        let tSexo = document.createTextNode(lista[0][i].sexo);

        cId.appendChild(tId);
        cNombre.appendChild(tNombre);
        cApellido.appendChild(tApellido);
        cLocalidad.appendChild(tLocalidad);
        cSexo.appendChild(tSexo);
        
        fila.appendChild(cId);
        fila.appendChild(cNombre);
        fila.appendChild(cApellido);
        fila.appendChild(cLocalidad);
        fila.appendChild(cSexo);
        
        fila.addEventListener("click",desplegarFormFila);

        tabla.appendChild(fila);
    }
}

function ObtenerLocalidades(resolve, reject)
{
    var request = new XMLHttpRequest();
    request.onreadystatechange = function()
    {
        if(this.status == 200 && this.readyState==4)
        {
            listaLocalidades = new Array(JSON.parse(this.responseText));
            resolve(listaLocalidades);
            $("divSpinner").hidden = true;
        }else if(this.status == 404 && this.readyState != 4)
        {
            reject();
            $("divSpinner").hidden = true;
        }
    }

    request.open("GET", "http://localhost:3000/localidades");
    request.send();
    $("divSpinner").hidden = false;
}

function CargarLocalidades(lista)
{
    let select = $("inputSelect");
    for(let i = 0; i < lista[0].length; i++)
    {
        let opt = document.createElement('option');
        opt.value=lista[0][i].nombre;
        opt.setAttribute("idLocalidad", lista[0][i].id);
        optText = document.createTextNode(lista[0][i].nombre);
        opt.appendChild(optText);
        select.appendChild(opt);
    }
}

function ErrorF()
{
    alert("Ocurrió un error");
}

function desplegarFormFila(event)
{
    $("divForm").hidden = false;
    
    var fila = event.target.parentNode; 

    var id = fila.childNodes[0].childNodes[0].nodeValue;
    let nombre = fila.childNodes[1].childNodes[0].nodeValue;
    let apellido = fila.childNodes[2].childNodes[0].nodeValue;
    let localidad = fila.childNodes[3].childNodes[0].nodeValue;
    let sexo = fila.childNodes[4].childNodes[0].nodeValue;

    $("inputNombre").value = nombre;
    $("inputApellido").value = apellido;
    sexo == "Female" ? $("rFemenino").checked = true : $("rMasculino").checked = true;
    $("inputSelect").value=localidad;

    $("btnModificar").onclick = ()=>
    {
        let flagValues = true;
        if($("inputNombre").value.length < 3)
        {
            $("inputNombre").style.borderColor = "red";
            flagValues = false;
        }
        if ($("inputApellido").value.length < 3)
        {
            $("inputApellido").style.borderColor = "red";
            flagValues = false;
        }

        if(flagValues)
        {
            let nombreN = $("inputNombre").value;
            let apellidoN = $("inputApellido").value;
            let localidadN = $("inputSelect").value;
            let sexoN =  $("rFemenino").checked == true ? "Female" : "Male";
            let idLocalidad = ObtenerLocalidadId(localidadN);
            

            let jsonObject = {"id":id, "nombre":nombreN,"apellido":apellidoN, "localidad":{id: idLocalidad, nombre: localidadN}, "sexo":sexoN };

            let promiseEditar = new Promise(function(resolve, reject)
                {
                    let request = new XMLHttpRequest();
                    request.onreadystatechange = function()
                    {
                        if(request.status == 200 && request.readyState == 4)
                        {
                            resolve();                  
                            $("divSpinner").hidden = true;
                        }
                    }

                    request.open("POST","http://localhost:3000/editar");
                    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    request.send(JSON.stringify(jsonObject));
                    $("divForm").hidden = true;
                    $("divSpinner").hidden = false;
                })

            promiseEditar.then(function()
            {
                fila.childNodes[1].childNodes[0].nodeValue = nombreN;
                fila.childNodes[2].childNodes[0].nodeValue = apellidoN;
                fila.childNodes[3].childNodes[0].nodeValue = localidadN;
                fila.childNodes[4].childNodes[0].nodeValue = sexoN;
            })
        }
    };
}

function ObtenerLocalidadId(nombre)
{
    for (let i=0; i<listaLocalidades[0].length; i++)
    {
        if(listaLocalidades[0][i].nombre == nombre)
        {
            return listaLocalidades[0][i].id;
        }
    }
}

function CerrarForm()
{
    $("divForm").hidden=true;
}
