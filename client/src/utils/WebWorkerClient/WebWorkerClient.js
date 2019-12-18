
export default class WebWorkerClient {

    constructor(worker) {
        this.cryptWorker = worker;
    };

    getWebWorkerResponse (messageType, messagePayload) {
        return new Promise((resolve, reject) => {
          const messageId = Math.floor(Math.random() * 100000)
      
          this.cryptWorker.postMessage([messageType, messageId].concat(messagePayload))
      
          const handler = function (e) {
            if (e.data[0] === messageId) {

                e.currentTarget.removeEventListener(e.type, handler)
        
                resolve(e.data[1])
            }
          }
      
          this.cryptWorker.addEventListener('message', handler)
        });
    };

    async postAndWait(messageType, messagePayload) {
        
        if(!this.cryptWorker) return 'CryptWorker object instance does not exist';
        let response;
        if(messageType === 'encrypt') {
            response = await this.getWebWorkerResponse(messageType,messagePayload);
            return response;
        } 
        else if(messageType === 'decrypt') {
            response = await this.getWebWorkerResponse(messageType, messagePayload.message);
            const data = {
                ...messagePayload,
                message : response
            };
            return data;
        } 
        return response;
    };

    async create() {
        
        if(!this.cryptWorker) return 'CryptWorker object instance does not exist';
        this.originPublicKey = await this.getWebWorkerResponse('generate-keys');
        return this.originPublicKey;
        
    };
};