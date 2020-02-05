interface FeedbackRequest {
    install: url /* fetch the npm installable gzip from here */
    
    /**
     * A string providing information on what release line is being submitted for feedback.
     * 
     * Some apps may only be capable of testing certain release lines.
     * They can use this line to filter and skip specific builds.
     */
    line: string
    
    /**
     * This URL is unique per repo/commit.
     * 
     * Submitting two reports with the same id but to different callbacks results in two different reports.
     */
    report_callback: url,

    /**
     * We can add more info here as we learn what folks need.
     */
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
    /**
     * Posting a report deletes the old report of the same id.
     * Reports are not addative or unioned, thus downstream tests should aggregate before sending.
     * 
     * You SHOULD send multiple reports as a means of updating status.
     * 
     * It is acceptable to post anywhere from a single test, to thousands.
     */
    id: string

    /**
     * The overal status of the report.
     * 
     * This may override the underlying tests. A test may fail, but the report may still pass.
     * It is up to the application runner to decide.
     * 
     * It does not affect requests back to our CI. Use `please` for requests.
     */
    status: Status 

    /**
     * Request back to our CI system, not necessarily honored.
     */
    please: Please

    tests: Test[]

    arch?: Arch
    os?: OS

    /**
     * This should be verbatim generated from a module which *WE* can distribute.
     */
    os_details?: string
}

/* It is allowable that only one Test is reported back which aggregates all actual test */
interface Test {
    /**
     * It is up to the application how to name test.
     * 
     * It is acceptable to have a single test.
     * It is also acceptable to submit thousands of tests for more granular tracking of failures between builds.
     */
    name: string

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
 * Other stuff
 */
enum Please {
    /**
     * Please reject the changes, something breaks!
     * 
     * This is used when an unexpected breaking change is encountered.
     */
    REJECT_CHANGES = 'block',

    /**
     * Approve the changes. Hopefully nothing breaks.
     */
    APPROVE_CHANGES = 'approve',

    /**
     * I'm testing. Don't merge until I'm finished.
     */
    WAIT_FOR_ME = 'wait',

    /**
     * I'm sitting this one out.
     */
    SKIP_ME = 'skip',
}
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
    READY = 'ready', // Tests have not been run
    RUNNING = 'run', // Tests are running 
    PASSED = 'pass', // Tests are passed!
    FAILED = 'fail', // Tests are failed
    ABORTED = 'abort', // Unknown error
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
