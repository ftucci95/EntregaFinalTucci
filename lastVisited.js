/* adición de última entrega finalmente !! */
/* necesito una función que actualice la data de la última fecha*/
function updateLastVisited()
{
  // para actualizar necesito tener la actual
  // actualDate lo voy a guardar para la próxima vez que entre a esta función (si se actualiza la página se verá la vez anterior)
  let actualDate = date2String(getDate());
  
  // lastDate lo actualicé la última vez que entré a esta función, así que de ahí saco la fecha
  let lastDate = localStorage.getItem('lastVisited');

  // TODO: mejorar el siguiente snippet
  if (lastDate == null)
  {
    lastDate = actualDate;
  }

  // ahora llamo a la función que interfacea con el HTML
  date2HTML (lastDate);

  localStorage.setItem('lastVisited',actualDate);
}

function date2HTML (Date2Push)
{

}

function date2String (Date)
{

}

function getDate()
{

}