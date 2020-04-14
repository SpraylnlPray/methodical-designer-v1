const query = `
	CREATE (ui:Node:AbstractUserInterface {id: randomUUID(), label: "UI", story: "Interaction point for the user", type: "AbstractUserInterface"})
	CREATE (api:Node:API {id: randomUUID(), label: "Server", story: "Endpoint for requests, fetches and mutates data from/on the DB", type: "API"})
	CREATE (pers:Node:Persistence {id: randomUUID(), label: "NeoDB", story: "Saves data for the methodical designer", type: "Persistence"})
	CREATE (event:Node:Event {id: randomUUID(), label: "Create Node", story: "Event for creating a node", type: "Event", synchronous: false, unreliable: true})
		
	CREATE (apitoui:Link:Mutate {id: randomUUID(), x_id: api.id, y_id: ui.id, label: "Mutates", story: "Populates the UI with data", type: "Mutate"})
	CREATE (api)-[:ACTION]->(apitoui)-[:ON]->(ui)
	
	CREATE (uitoevent:Link:Trigger {id: randomUUID(), x_id: ui.id, y_id: event.id, label: "Triggers", story: "Dispatch mutation call to the API", type: "Trigger"})
	CREATE (ui)-[:ACTION]->(uitoevent)-[:ON]->(event)
	
	CREATE (eventtoapi:Link:Trigger {id: randomUUID(), x_id: event.id, y_id: api.id, label: "Triggers", story: "Invoke mutation function to alter data in the DB", type: "Trigger"})
	CREATE (event)-[:ACTION]->(eventtoapi)-[:ON]->(api)
	
	CREATE (apitopersmutate:Link:Mutate {id: randomUUID(), x_id: api.id, y_id: pers.id, label: "Mutates", story: "Mutates the data in the DB upon an event from the UI", type: "Mutate"})
	CREATE (api)-[:ACTION]->(apitopersmutate)-[:ON]->(pers)
	
	CREATE (apitopersread:Link:Read {id: randomUUID(), x_id: api.id, y_id: pers.id, label: "Read", story: "Fetches data from the DB", type: "Read"})
	CREATE (api)-[:ACTION]->(apitopersread)-[:ON]->(pers)
	
	CREATE (seqonevent:Sequence {id: randomUUID(), group: "Sequence Group", label: "Test Sequence", seq: 1})
	CREATE (uitoevent)-[:IS]->(seqonevent)-[:ON]->(uitoevent)
`;

module.exports = query;