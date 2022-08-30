export default class WorkerHelp {
    deepAssign(args: any[]): void;
    pendingJobs: any;
    createWorker(f: (data: {
        jobId: number;
        params: any;
    }) => any): (...message: any) => Promise<unknown>;
}
