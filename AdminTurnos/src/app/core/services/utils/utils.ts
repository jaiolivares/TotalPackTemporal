import { saveAs } from 'file-saver';
import { TextEncoder } from 'text-encoding';
export function groupByKey(xs:any, key:any) {
  return xs.reduce(function(rv:any, x:any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, []).filter((e:any) => e.length);
};
export function groupByStringKey(xs:any, key:any) {
  return xs.reduce(function(rv:any, x:any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
export function groupByFirstIndex(xs:any) {
  return xs.reduce(function(rv:any, x:any, i:any) {
    (rv[i] = rv[i] || []).push(x[0]);
    return rv;
  }, []).filter((e:any) => e.length);
};

export function secondsToString(seconds:any) {
  seconds = Math.abs(seconds);
  let hour:any = Math.floor(seconds / 3600);
  hour = (hour < 10)? '0' + hour : hour;
  let minute:any = Math.floor((seconds / 60) % 60);
  minute = (minute < 10)? '0' + minute : minute;
  let second:any = Math.floor(seconds % 60);
  second = (second < 10)? '0' + second : second;
  return hour + ':' + minute + ':' + second;
}
export function secondsToMinuteString(seconds:any) {
  seconds = Math.abs(seconds);
  let minute:any = Math.floor((seconds / 60) % 60);
  minute = (minute < 10)? '0' + minute : minute;
  let second:any = Math.floor(seconds % 60);
  second = (second < 10)? '0' + second : second;
  return  minute + ':' + second;
}

export function stringToSeconds(t:string) {
  let convertir: any[] = t.split(':');
  return parseInt(convertir[0])*3600 + parseInt(convertir[1])*60 + parseInt(convertir[2]);
}
export function stringNumbersToSeconds(t:string) {
  return parseInt(t[0]+t[1])*3600 + parseInt(t[2]+t[3])*60 + parseInt(t[4]+t[5]);
}
export function minutesStringToSeconds(t:string) {
  let convertir: any[] = t.split(':');
  return  parseInt(convertir[0])*60 + parseInt(convertir[1]);
}
export function pad(d:any) {
  return (d < 10) ? '0' + d.toString() : d.toString();
}


export function handleErrors(e:any, customMessage = false, message = ''){
  // let mensajeErrores
  // if (e.response) {
  //   if (e.response.data?.data?.errores) {
  //     const erroresValidacion = Object.values(e.response.data?.data?.errores)
  //     erroresValidacion.forEach(error => {
  //       if (mensajeErrores) {
  //         mensajeErrores = `${mensajeErrores} ${error}`
  //       } else {
  //         mensajeErrores = `${error}`
  //       }
  //     })
  //   }
  // }
  // toast({
  //   component: ToastificationContent,
  //   props: {
  //     title: customMessage ? message : `Ha ocurrido un error al completar el formulario. ${
  //       mensajeErrores || ''
  //     }`,
  //     icon: 'CheckCircleIcon',
  //     variant: 'error',
  //   },
  // })
}

export function handleTexts(value:any,text:any){
  let generatedText = value;
  if(generatedText){
    generatedText = generatedText + text
  } else {
    generatedText = text
  }
  return generatedText
}

export function exportDataToTextFile(data: string, filename: string): void {
  const encoding = 'windows-1252'; // a.k.a ANSI
  const encoder = new TextEncoder(encoding, {
    NONSTANDARD_allowLegacyEncoding: true
  });
  const encodedData = encoder.encode(data); // `data` is an Uint8Array
  const encoded_as_ANSI = new Blob([encodedData], {type:'text/plain;charset=windows-1252'});
  saveAs(encoded_as_ANSI, filename);
}