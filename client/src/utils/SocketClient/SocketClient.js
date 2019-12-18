import io from 'socket.io-client';

const host = 'https://localhost:5000';

export default class socketAPI {
    socket;
    token;

    connect() {
        this.token = localStorage.getItem('token');
        this.socket = io.connect(host, {
            query : {token : this.token},
            secure : true
        });

        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => resolve());
            this.socket.on('connect_error', (error) => reject(error));
          });
    };

    disconnect() {
        return new Promise((resolve) => {
          this.socket.disconnect(() => {
            this.socket = null;
            resolve();
          });
        });
    }
    
    emit(event, data) {
        
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject('No socket connection.');
             
            return this.socket.emit(event, data, (response) => {
            // Response is the optional callback that you can use with socket.io in every request. See 1 above.
            if (response.error) {
                console.error(response.error);
                return reject(response);
            }

            return resolve(response);
            });
        });
    }

    on(event, fun) {
    // No promise is needed here, but we're expecting one in the middleware.
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject('No socket connection.');

            if(this.socket._callbacks['$' + event] == undefined) {
                
                this.socket.on(event, fun);
                
            } 
            resolve();
        });
    }
}