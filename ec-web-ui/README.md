# Enterprise-Connect Web UI
Environment | Build Status
--- | ---
[Predix R2](https://ec-web-ui-tokyo.grc-apps.svc.ice.ge.com) | <a href='https://predix1.jenkins.build.ge.com/job/Enterprise-Connect/EC Web UI (R2)'><img src='https://predix1.jenkins.build.ge.com/buildStatus/icon?job=Enterprise-Connect/EC Web UI (R2)'></a>
[Predix Basic](https://ec-web-ui-osaka.run.aws-usw02-pr.ice.predix.io) | <a href='https://predix1.jenkins.build.ge.com/job/Enterprise-Connect/EC Web UI (Basic)'><img src='https://predix1.jenkins.build.ge.com/buildStatus/icon?job=Enterprise-Connect/EC Web UI (Basic)'></a>
[Predix Select](https://ec-web-ui-nara.run.asv-pr.ice.predix.io) | <a href='https://predix1.jenkins.build.ge.com/job/Enterprise-Connect/EC Web UI (Select)'><img src='https://predix1.jenkins.build.ge.com/buildStatus/icon?job=Enterprise-Connect/EC Web UI (Select)'></a>

## Usage
1. Deploy an EC gateway in a supported environment. (R2/Basic/Select)
![alt tag](docs/Screen Shot 2016-12-05 at 8.01.32 PM.png)

2. Get the gateway's credential from VCAP_SERVICE
![alt tag](docs/Screen Shot 2016-12-05 at 8.04.34 PM.png)

3. Update EC Client/Server settings.json
4. Run EC Client/Server.
![alt tag](docs/Screen Shot 2016-12-05 at 8.06.43 PM.png)
![alt tag](docs/Screen Shot 2016-12-05 at 8.06.56 PM.png)

5. Open up a brower (tested in Chrome) and point the URL to one of the EC Web UI instances by clicking on the above environment link in this repo.
![alt tag](docs/Screen Shot 2016-12-05 at 8.10.26 PM.png)

6. Before the usage, make sure the browser cache is clear.
![alt tag](docs/Screen Shot 2016-12-05 at 8.47.29 PM.png)

7. Type in a zone id for the service in the selected environment (R2/Basic/Select) and press enter.
8. Begin data exchange and see the memory usage in the gateway in realtime.

##Sample Screenshots
![alt tag](docs/Screen Shot 2016-12-05 at 7.48.21 PM.png)
