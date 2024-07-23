# Instrucciones
1. Instalar docker desktop
2. Situarse en el directorio raiz del proyecto en la linea de comandos
3. Ejecutar 

        docker build -t emisor-front .

4. Una vez finalizado, ejecutar

        docker run -d -p 4202:4200 --name emisor-front emisor-front 
        
5. ejecutar en el navegador http://localhost:4202/
