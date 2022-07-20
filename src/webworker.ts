export default class WorkerHelp {
    deepAssign(args: any[]): void {
        return args.reduce(deepClone, args[0])
        function deepClone(target: any, obj: any) {
            if (!target) target = Array.isArray(obj) ? [] : {};
            if (obj && typeof obj === "object") {
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (obj[key] && typeof obj[key] === "object") {
                            target[key] = deepClone(target[key], obj[key])
                        } else {
                            target[key] = obj[key];
                        }
                    }
                }
            }
            return target
        }
    }
    pendingJobs: any = {}
    createWorker(f: (data: { jobId: number, params: any }) => any) {
        const worker = new Worker(URL.createObjectURL(new Blob([`(${f.toString()})()`])))
        worker.onmessage = ({ data: { result, jobId } }) => {
            console.log('onmessage', result)
            this.pendingJobs[jobId](result);
            delete this.pendingJobs[jobId]
        }
        worker.onerror = (data) => {
            console.log('onerror', data)
        }
        return (...message: any) =>
            new Promise((resolve: any) => {
                const jobId = String(Math.random());
                this.pendingJobs[jobId] = resolve;
                worker.postMessage({ jobId, message })
            })

    }

}