interface FeedbackRequest {
    install: url /* fetch the npm installable gzip from here */
    line: string /* master, nightly, 9x, 8x, etc. */
    report_callback: url,
}

interface FeedbackRequestResponse {
     /**
      * This token must be included in future requests for this CI run.
      * 
      * It is permissible to use a fixed token, but we allow the flexibility of generating per-request tokens.
      * That is one less credential sitting on CI machines waiting to be compromised.
      */
    session_token: string
}

/**
 * Responding with a FeedbackRequestResponse is a positive signal that our CI should wait for your app.
 * 
 * If you don't respond, we assume you are not interested.
 */
function example_reservation_webhook_handler(fr: FeedbackRequest): FeedbackRequestResponse {
    return {
        session_token: `some random token`
    }
}

/**
 * Reports are generally one run of an apps CI on a single instance of hardware/software.
 * 
 * For example, if you test on Mac, Win, and Linux you submit three reports.
 */
interface Report {
    id: string

    /**
     * The overal status of the report.
     * 
     * This may override the underlying tests. A test may fail, but the report may still pass.
     * It is up to the application runner to decide.
     */
    status: Status 

    /**
     * Posting a report deletes the old report of the same id.
     * Reports are not addative or unioned, thus downstream tests should aggregate before sending.
     * 
     * You SHOULD send multiple reports as a means of updating status.
     * 
     * It is acceptable to post anywhere from a single test, to thousands.
     */
    tests: Test[]

    arch?: Arch
    os?: OS
    os_version?: string
}

/* It is allowable that only one Test is reported back which aggregates all actual test */
interface Test {
    id: string /* This will be used to report trends */

    source_link?: url /* optional link to code */
    
    datetime_start?: Date
    datetime_stop?: Date
    
    /* Aggregates of underlying test/assertions */
    total_ready?: number
    total_passsed?: number
    total_skipped?: number
    total_aborted?: number
    total_warnings?: number
    total_failed?: number

    /**
     * Optional download for debugging build/test artifacts.
     */
    workspace_gzip_link?: url
    
    /**
     * Any log files.
     */
    logfile?: url 

    /**
     * The Circle/Jenkins/whatever link
     */
    link?: url
}

/**
 * OPTIONAL - This may be skipped for now
 * 
 * The reservation informs CI about how many reports it should expect to see back.
 * It is possible to submit reports without a reservation.
 */
interface Reservations {
    reservations: Reservation[]
}
interface Reservation {
    report_id: string
    
    /**
     * How long do we hold this reservation before moving on. 
     * This effectively blocks CI until the lease expires, or the report is uploaded.
     */
    lease: Date
}


/**
 * Other stuff
 */

enum Arch {
    ARM   = 'arm',
    ARM64 = 'arm64',
    x86   = 'x86',
    AMD64 = 'amd64',
    MIPS  = 'mips',
}
enum OS {
    MACOS = 'macos',
    WIN   = 'win',
    LINUX = 'linux',
}

enum Status {
    READY = 'ready', // Tests have not been run - BLOCKS CI
    RUNNING = 'run', // Tests are running - BLOCKS CI
    PASSED = 'pass', // Tests are passed!
    FAILED = 'fail', // Tests are failed - BLOCKS CI
    ABORTED = 'abort', // Unknown error - WARNS CI
    SKIPPED = 'skip', // Tests not run
}

type url = string

/**
 * Example
 */

declare const nextFeedbackRequest: () => {
    req: FeedbackRequest,
    res(res: FeedbackRequestResponse): Promise<void>
}
declare const RunCI: (line: string) => Promise<Report>
async function mainwebhook() {
    // new incoming request!
    let { req: { install, line, report_callback }, res } = await nextFeedbackRequest()
    // make sure to reply
    await res({ session_token: 'hello' })
    
    // kick off CI
    let report = await RunCI(install)

    await fetch(report_callback, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Session-Token': 'hello'
        },
        body: JSON.stringify(report)
    })
}
