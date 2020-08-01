/* eslint-disable no-undef */
import faker from "faker";

export const login = (agent,cb) => {
    agent
        .post("/login")
        .send({ username: "testaccount", password: "12345689234abcd" })
        .expect(200).end((err,res) => {
	    expect(err).toBeNull();
	    cb(res.headers["set-cookie"]);
        });
};

export const createRant = (agent,{rant,cookie},cb) => {
    agent
        .post("/rant/post/")
        .set("cookie", cookie)
        .send({
	    rant,
	    tags: []
        })
        .expect(201).end((err,res) => {
	    expect(err).toBeNull();
	    cb(res.body.message.rantId);
        });
};

export const createUser = (agent,cb) => {
    agent
        .post("/register/reg-first-step")
        .send({
	    username : faker.internet.userName(),
	    password : faker.internet.password(),
	    email    :    faker.internet.email()
        }).expect(201).end((err,res) => {
	    expect(err).toBeNull();
	    cb(res.headers["set-cookie"]);
        });
};


export const deleteRant = (agent,{cookie,rantId},cb) => {
    agent
	.delete(`/rant/post/delete/${rantId}`)
	.set("cookie", cookie)
	.expect(200).end((err,res) => {
	    expect(err).toBeNull();
	    cb();
	});
};
