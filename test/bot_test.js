let assert = require("assert");
let chai = require("chai");
let rewire = require("rewire");
let sinon = require("sinon");
let expect = chai.expect;

describe("bot", () => {
    let bot = rewire("../bot.js");
    let fsStub = {
        writeFile: sinon.stub()
    }
    bot.__set__("fs", fsStub);
    describe("#displayactors", () => {
        let displayActors = bot.__get__("displayactors");
        let channelStub = {
            send: sinon.stub()
        }
        it("call with correct parameters - display most viewed actors", (done) => {
            displayActors("!cast 20", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("`"));
            done();
        });
        it("too high parameter - max 2000 chars", (done) => {
            displayActors("!cast 2000", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("response"));
            done();
        });
    });
    describe("#displaydetails", () => {
        let displayDetails = bot.__get__("displaydetails");
        let channelStub = {
            send: sinon.stub()
        }
        it("call with correct parameters - display details", (done) => {
            displayDetails("!info Emma Stone", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("***Emma Stone"));
            done();
        });
        it("call with incorrect parameters - cast member not found", (done) => {
            displayDetails("!info Emmola Stonepa", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("cast member"));
            done();
        });
        it("call with incorrect number of parameters, too many - cast member not found", (done) => {
            displayDetails("!info this is way to many args", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("cast member"));
            done();
        });
        it("call with incorrect number of parameters, too few 1 - cast member not found", (done) => {
            displayDetails("!info ", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("cast member"));
            done();
        });
        it("call with incorrect number of parameters, too few 2", (done) => {
            displayDetails("!info", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("cast member"));
            done();
        });
    });
    describe("#addsegment", () => {
        let addSegment = bot.__get__("addsegment");
        let channelStub = {
            send: sinon.stub()
        }

        it("call with correct parameters - segment added", (done) => {
            addSegment("!segment segment 1", channelStub);
            expect(channelStub.send.getCall(0).args[0] === "segment added");
            done();
        });
        it("already existing segment", (done) => {
            addSegment("!segment Pre-Pipeline", channelStub);
            expect(channelStub.send.getCall(0).args[0] === "segment already exists");
            done();
        });
    });
    describe("#displaydirectors", () => {
        let displaydirectors = bot.__get__("displaydirectors");
        let channelStub = {
            send: sinon.stub()
        }
        it("call with correct parameters - display most viewed directors", (done) => {
            displaydirectors("!directors 20", channelStub);
            expect(channelStub.send.getCall(0).args[0].startsWith("`"));
            done();
        });
    });
    describe("#displaymovies", () => {

    });
    describe("#updatepinnedmessage", () => {

    });
    describe("#addToDatabase", () => {

    });
    describe("#parseadd", () => {

    });
    let client = bot.__get__("client");
    client.destroy();
    
});