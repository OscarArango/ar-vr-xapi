var xAPId = window.parent;

/**************    Bookmarking   ******************/
function TCAPI_SetBookmark() {
    loc = window.location.href;
    xAPId.TCAPI_SetBookmark(
        loc.substring(loc.toLowerCase().lastIndexOf("/course/") + 8, loc.length), // value
        document.title // name
    );
    xAPId.TCAPI_CommitData();
}
/**************  / Bookmarking   ******************/


/**************    Mark Complete   ******************/
// Call function on last page of the course
function SetSCOComplete() {
    xAPId.SetReachedEnd();
    xAPId.TCAPI_CommitData();
}
/**************  / Mark Complete   ******************/
