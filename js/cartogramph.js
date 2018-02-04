

//makes a plain cartogram
function simpleCartogram(visID,mapcolor){    
    var c = new makecartogram(visID,GEODATA,POPULATION,POPULATION_COL,POPULATION_LABEL,"","","",mapcolor);
}

function customCartogram(visID,customDataSource,customColumn,customLabel,mapcolor){
    makecartogram(visID,GEODATA,customDataSource,customColumn,customLabel,"","","",mapcolor);

}

function chloroplethCartogram(visID,chloroplethDataSource,chloroplethColumn,chloroplethLabel,mapcolor){
    makecartogram(visID,GEODATA,POPULATION,POPULATION_COL,POPULATION_LABEL,chloroplethDataSource,chloroplethColumn,chloroplethLabel,mapcolor);
}

function makecartogram(visID,geoData,customDataSource,customColumn,customLabel,chloroplethDataSource,chloroplethColumn,chloroplethLabel,mapcolor){

    //toggle
    var current = 'cartogram-button';

    //total population
    var totalpop = 0;

    //average of chloropleth variable
    var ave = 0;

    //format
    var commaformat = d3.format(",");

    //color
    var color = d3.scale.linear()
    .domain([0, 100])
    .range(["#fff8ef",mapcolor]);

    //draw vis
    var height = 800;
    var width  = 600;

    var vis = d3.select(visID).append("svg").attr("width", width).attr("height", height).attr("cartogram","true");

    var scale = 2200,
        translateX = -4400,
        translateY = 820;

    var projection = d3.geo.mercator()
        .scale(scale)
        .translate( [translateX, translateY]);

    var nodes = [];
    var mmnodes = [];  //metromanila nodes
    var cnodes = []; //central luzon region
    var cbnodes = []; //calabarzon region
    var nmnodes = [];  //north of manila
    var smnodes = [];  //south of manila

    var root = {};

        root.radius = 0;
        root.fixed = true; 

    var rad = d3.scale.linear().domain([1,5000000]).range([1,20]); 

    var path = d3.geo.path().projection(projection);
        
    //gradient
    var gradient = vis.append("defs")
      .append("linearGradient")
        .attr("id", visID.replace(/#/g,'')+"gradient");        

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#fff8ef")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", mapcolor)
        .attr("stop-opacity", .9);

    //draw map
    d3.json(geoData, draw);
    function draw(geo_data) {        
        "use strict";
    
        //add the detail box
        var boxGroup = vis.append("g").attr("transform","translate(10,200)");       
        boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 40)
            .attr("class","munid")
            .text("Philippines");
      
        var provinces = topojson.feature(geo_data, geo_data.objects.provsh).features;

        //enter custom data
        d3.csv(customDataSource, function(error,csv){
          
            csv.forEach(function(d, i) {
                provinces.forEach(function(e, j) {
                
                    if (d.province === e.properties.PROVINCE.toUpperCase()) {
                        e[customColumn] = +d[customColumn];              
                    }
                    // if ((e.properties.PROVINCE==="Metropolitan Manila")&&(d.province === e.properties.NAME_2.toUpperCase())){                            
                    //     e[customColumn] = +d[customColumn];   
                    // }

                })

            totalpop += parseInt(d[customColumn]);
            
            })

            //enter chloropleth data
            var counter = 0;
            var sumrate = 0;

            //add the population label
            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 70)
            .attr("class","populationlabel")
            .text(customLabel+": ");  
            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 90)
            .attr("class","population")
            .text(commaformat(totalpop));            

            if(chloroplethDataSource!=""){
                

                d3.csv(chloroplethDataSource, function(error,csv){
                    csv.forEach(function(f, g) {
                        provinces.forEach(function(e, j) {
    
                            if (f.province === e.properties.PROVINCE.toUpperCase()) {
                              e[chloroplethColumn] = +f[chloroplethColumn];             
                            }
                            // if ((e.properties.PROVINCE==="Metropolitan Manila")&&(f.province === e.properties.NAME_2.toUpperCase())){                            
                            //   e[chloroplethColumn] = +f[chloroplethColumn]; 
                            // }
                        });
                        counter++;
                        sumrate += +f[chloroplethColumn];
                    });
                    ave = (sumrate/counter).toFixed(2);

                    //rest of the code should go here
                    drawGeographicMap(vis,visID,provinces,customColumn,path,totalpop,chloroplethDataSource,chloroplethColumn,mapcolor,color);


                });

  
                //add chloropleth labels
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 120)
                .attr("class","poverty_label")
                .text(chloroplethLabel + ": ");  
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 140)
                .attr("class","poverty")
                .text(ave+"%");  
                
                //add legend
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 200)
                .attr("class","legend_label")
                .text("Legend");  
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 230)
                .attr("class","tiny")
                .text("0");  
                boxGroup.append("text") 
                .attr("x", 100)
                .attr("y", 230)
                .attr("class","tiny")
                .text("100");
                boxGroup.append("rect")  
                .attr("x", 0)
                .attr("y", 205)
                .attr("width", 120)
                .attr("height", 10)
                .attr("fill","url("+visID+"gradient)");

            }

            //lets make the geographic map            
            else{
                drawGeographicMap(vis,visID,provinces,customColumn,path,totalpop,chloroplethDataSource,chloroplethColumn,mapcolor,color);
            }
            function drawGeographicMap(vis,visID,provinces,customColumn,path,totalpop,chloroplethDataSource,chloroplethColumn,mapcolor,color){

                var philmap = vis.append("g").attr("class","philmap").attr("transform", "translate(0,50)");
                          
                var map = philmap.selectAll("path")
                    .data(provinces)
                    .enter()
                    .append("path")
                      .attr("class", function(d){
                        // if((d.properties.NAME_1==="Metropolitan Manila")){
                        //     return d.properties.NAME_2.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase()+" province";
                        // }
                        // else
                            return d.properties.NAME_1.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase()+" province";
                      })
                      .attr("population",function(d){return d[customColumn];})
                      .attr("province", function(d){
                        // if((d.properties.NAME_1==="Metropolitan Manila")){
                        //     return d.properties.NAME_2;
                        // }
                        // else
                            return d.properties.NAME_1;
                      })
                      .attr("d", path)              
                      .attr("r", 10)       
                      .attr("rate",function(d){
                        if(chloroplethDataSource!=""){
                            return d[chloroplethColumn]+"%";
                        }
                        else{
                            return 0;
                        }
                        })       
                      .style("fill", function(d) {  
                        if(chloroplethDataSource!=""){    
                          if(d[chloroplethColumn]==null){
                            return "#ffffff";
                          }
                          else
                            {return color(d[chloroplethColumn]);} 
                        
                        }
                        else if(d.properties.NAME_1!="Laguna Lake"){
														// NOTE: custom
														return getColorForIslandGroup(d.properties.NAME_1)
                            // return mapcolor;
                        }
                        else{
                            return '#ffffff';
                        }
                    })
                      .style("stroke", "#666")
                      .style("stroke-width", 0.5)
                      .style("fill-opacity", "0.9");   

                //lets make the nodes
                var SIZER = 15;
                provinces.forEach(function(d, i) {  
                    if(d.properties.NAME_1!="Laguna Lake"){   
                        var getid = "";
                        // if((d.properties.NAME_1==="Metropolitan Manila")){
                        //     getid = d.properties.NAME_2.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase();
                        // }
                        // else
                            getid = d.properties.NAME_1.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase();   
                        
                        var node = {};
                        
                        var area = 0;    
                        var pop = d[customColumn];

                        var vid = visID.replace(/#/g,'');

                        //compute for the new size and position of the rectangle
                        
                        var arw = document.getElementById(vid).getElementsByClassName(getid)[0].getBoundingClientRect().width;
                        var arh = document.getElementById(vid).getElementsByClassName(getid)[0].getBoundingClientRect().height;

                        var xratio = (arw/arh).toFixed(2);
                        area = (pop/totalpop*100); 

                        var rectsizer = Math.sqrt(area/xratio);

                        var xwidth = (xratio * rectsizer)*SIZER;
                        var yheight = rectsizer*SIZER;

                        var centerx = path.centroid(d)[0];
                        var centery = path.centroid(d)[1];

                        var startx = centerx - (xwidth/2);
                        var starty = centery - (yheight/2);

                        node.width = xwidth;
                        node.height = yheight;
                        node.x = startx;
                        node.y = starty;
                        node.class = "";
                        node.population = d[customColumn];
                        if(chloroplethDataSource!=""){
                            node[chloroplethColumn] = d[chloroplethColumn];
                        }

                        if((d.properties.NAME_1==="Metropolitan Manila")){
                            //node.province = d.properties.NAME_2; 
                            node.province = d.properties.NAME_1;                
                            node.class = "metromanila";
                            mmnodes.push(node);
                        }
                        else{
                            node.province = d.properties.NAME_1;
                            if((d.properties.REGION==="Central Luzon (Region III)")){
                                node.class = "central";
                                cnodes.push(node);
                            }
                            else if((d.properties.REGION==="CALABARZON (Region IV-A)")){
                                node.class = "calabarzon";                    
                                cbnodes.push(node);
                            }
                            else if((d.properties.REGION==="Ilocos Region (Region I)")
                                ||(d.properties.REGION==="Cagayan Valley (Region II)")                                
                                ||(d.properties.REGION==="Cordillera Administrative Region (CAR)")
                                ){
                                node.class = "northmanila";
                                nmnodes.push(node);
                            }
                            else{
                                node.class = "southmanila";
                                smnodes.push(node);
                            }
                        }
                                    
                    }
                });        

                //draw different node sections
                var nmnodemap = drawnodes(vis,"nmnodemap",nmnodes,0,-20,chloroplethDataSource,chloroplethColumn,mapcolor,color);
                var smnodemap = drawnodes(vis,"smnodemap",smnodes,0,145,chloroplethDataSource,chloroplethColumn,mapcolor,color);
                var mmnodemap = drawnodes(vis,"mmnodemap",mmnodes,5,45,chloroplethDataSource,chloroplethColumn,mapcolor,color);
                var cnodemap = drawnodes(vis,"cnodemap",cnodes,0,0,chloroplethDataSource,chloroplethColumn,mapcolor,color);
                var cbnodemap = drawnodes(vis,"cbnodemap",cbnodes,0,110,chloroplethDataSource,chloroplethColumn,mapcolor,color);

                //adjust gravity and charge here
                //forcelayout(mmnodes,mmnodemap,0.01,-.6);
                forcelayout(nmnodes,nmnodemap,0.0005,0);
                forcelayout(cbnodes,cbnodemap,0.0004,-2);
                forcelayout(cnodes,cnodemap,0,-1);
                forcelayout(smnodes,smnodemap,0.001,-1);

                //add hover action    
                $(visID+' .province').on("mouseenter",munihover).on("mouseleave",hidedetail);
                d3.selectAll(visID+" .philmap").classed("hidden",true);

            }




            //make the node drawing function
            function drawnodes(vis,nodemapid,nodes,translatex,translatey,chloroplethDataSource,chloroplethColumn,mapcolor,color){
                var nodemap = vis.append("g").attr("class",nodemapid).attr("transform", "translate("+translatex+","+translatey+")");
                nodemap.selectAll("rect")
                    .data(nodes)
                  .enter().append("rect")
                    .attr("x", function(d) { 
  
                        if(d.x!=null)
                            {return d.x; }
                        else{
                            return 0;
                        }})
                    .attr("y", function(d) { 
                        if(d.y!=null)
                            {return d.y; }
                        else{
                            return 0;
                        }})
                    .attr("width", function(d) { 
                        if(d.width!=null)
                            {return d.width; }
                        else{
                            return 0;
                        }})
                    .attr("height", function(d) { 
                        if(d.height!=null)
                            {return d.height; }
                        else{
                            return 0;
                        }})
                    .attr("province", function(d) { return d.province; })
                    .attr("class", function(d) { return "province " + d.class; })
                    .attr("population", function(d) {                     
                        return d.population; })
                    .attr("rate", function(d) {    
                    if(chloroplethDataSource!=""){            
                        return d[chloroplethColumn]+"%"; 
                    }
                    else{
                        return 0;
                    }
                    })
                    .style("fill", function(d) {       
                    if(chloroplethDataSource!=""){              
                        return color(d[chloroplethColumn]); 
                    }
                    else{
												// NOTE: custom
												return getColorForIslandGroup(d['province'])
                        // return mapcolor;
                    }
                })
                    .style("fill-opacity", "0.9");  

                    return nodemap;      
            }


            //make the force function
            function forcelayout(nodes,nodemap,gravity,charge){
                var radius = 0;
                var force = d3.layout.force()
                    .gravity(gravity)
                    .charge(charge)
                    .nodes(nodes)
                    .size([50, height]);

                force.start();
                force.on("tick", function(e) {
                  var q = d3.geom.quadtree(nodes),
                      i = 0,
                      n = nodes.length;

                  while (++i < n) q.visit(collide(nodes[i]));

                  nodemap.selectAll("rect")
                      .attr("x", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
                      .attr("y", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
                });
            }

            //additional functions - thank you Eric Dobbs
            var overlap = function(a, b) {
                var ref, ref1, ref2, ref3;
                return ((a.x < (ref = b.x)) && (ref < a.x2) && (a.y < (ref1 = b.y)) && (ref1 < a.y2)) || 
                ((a.x < (ref2 = b.x2)) && (ref2 < a.x2) && (a.y < (ref3 = b.y2)) && (ref3 < a.y2));
            };

            function collide(node) {
                var nx1, nx2, ny1, ny2, padding;
                padding = 30;
                nx1 = node.x - padding;
                nx2 = node.x2 + padding;
                ny1 = node.y - padding;
                ny2 = node.y2 + padding;
                return function(quad, x1, y1, x2, y2) {
                var dx, dy;
                if (quad.point && (quad.point !== node)) {
                  if (overlap(node, quad.point)) {
                    dx = Math.min(node.x2 - quad.point.x, quad.point.x2 - node.x) / 2;
                    node.x -= dx;
                    quad.point.x += dx;
                    dy = Math.min(node.y2 - quad.point.y, quad.point.y2 - node.y) / 2;
                    node.y -= dy;
                    quad.point.y += dy;
                  }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                };
            };

    });


    //draw buttons

    var mapButton = vis.append("g")
        .attr("class", "map-button")
        .attr("transform","translate(10,5)");
    mapButton.append("rect") 
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", 60)
        .attr("height", 30)
        .style('fill',"#fff")
        .style("stroke-width", 2 )
        .style("stroke", '#ef4631' );
    mapButton.append("text") 
        .attr("x", 10)
        .attr("y", 20)        
        .style("fill", '#ef4631' )
        .text('Map');   


    var cartogramButton = vis.append("g")
        .attr("class", "cartogram-button")
        .attr("transform","translate(80,5)");
    cartogramButton.append("rect") 
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", 100)
        .attr("height", 30)
        .style('fill',"#ef4631")
        .style("stroke-width", 2 )
        .style("stroke", '#ef4631' );
    cartogramButton.append("text") 
        .attr("x", 10)
        .attr("y", 20)        
        .style("fill", '#fff' )
        .text('Cartogram');         


    //add actions
    $(visID+' .map-button').on('click',function(){    

        changebutton('map-button','cartogram-button',visID);            
        rendermap(visID);
    });
    $(visID+' .cartogram-button').on('click',function(){

        changebutton('cartogram-button','map-button',visID);
        rendersize(visID);
    });


    function rendermap(visID){

        var oneBar = d3.selectAll(visID+" .philmap");
        oneBar.classed("hidden", false);      

        oneBar = d3.selectAll(visID+" .mmnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .nmnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .cnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .cbnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .smnodemap");
        oneBar.classed("hidden", true);  
        
    }

    function rendersize(visID){
        var oneBar = d3.selectAll(visID+" .philmap");
        oneBar.classed("hidden", true);
        
        oneBar = d3.selectAll(visID+" .mmnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .nmnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .cnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .cbnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .smnodemap");
        oneBar.classed("hidden", false); 
                  
    }

    function changebutton(button,current,visID){        
        d3.selectAll(visID+" ."+current).select('rect').style("fill","#ffffff");
        d3.selectAll(visID+" ."+current).select('text').style("fill","#ef4631");
        d3.selectAll(visID+" ."+button).select('rect').style("fill","#ef4631");
        d3.selectAll(visID+" ."+button).select('text').style("fill","#ffffff");
    }

    function munihover(e){    
        $(visID+' .munid').text($(this).attr("province"));   
        $(visID+' .population').text(commaformat($(this).attr("population")));
        if(chloroplethDataSource!=""){
        $(visID+' .poverty').text($(this).attr("rate")); }
        $(this).css("fill-opacity",0.5);           
    }

    function hidedetail(e){
        $(visID+' .munid').text("Philippines");
        $(visID+' .population').text(commaformat(totalpop));
        if(chloroplethDataSource!=""){
        $(visID+' .poverty').text(ave+"%"); }
        $(this).css("fill-opacity",0.9);
    }

    return vis;

    }
}

function getColorForIslandGroup(province) {
	"use strict"

	let color = '#000'
	
	if (isLuzon(province)) color = '#0d47a1';
	else if (isVisayas(province)) color = '#ff6f00';
	else if(isMindanao(province)) color = '#b71c1c';

	return color;
}

function isLuzon(province) {
	"use strict"

	const luzonProvinces = ['METROPOLITAN MANILA', 'ABRA', 'APAYAO', 'BENGUET', 'IFUGAO', 'KALINGA', 'MOUNTAIN PROVINCE', 'ILOCOS NORTE', 'ILOCOS SUR', 'LA UNION', 'PANGASINAN', 'BATANES', 'CAGAYAN', 'ISABELA', 'NUEVA VIZCAYA', 'QUIRINO', 'BATAAN', 'BULACAN', 'NUEVA ECIJA', 'PAMPANGA', 'TARLAC', 'ZAMBALES', 'AURORA', 'BATANGAS', 'CAVITE', 'LAGUNA', 'QUEZON', 'RIZAL', 'MARINDUQUE', 'OCCIDENTAL MINDORO', 'ORIENTAL MINDORO', 'PALAWAN', 'ROMBLON', 'ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON'];

	return luzonProvinces.includes(province.toUpperCase());
}

function isVisayas(province) {
	"use strict"

	const visayasProvinces = ['AKLAN', 'ANTIQUE', 'CAPIZ', 'GUIMARAS', 'ILOILO', 'NEGROS OCCIDENTAL', 'BOHOL', 'CEBU', 'NEGROS ORIENTAL', 'SIQUIJOR', 'BILIRAN', 'EASTERN SAMAR', 'LEYTE', 'NORTHERN SAMAR', 'SAMAR', 'SOUTHERN LEYTE'];

	return visayasProvinces.includes(province.toUpperCase());
}

function isMindanao(province) {
	"use strict"

	const mindanaoProvinces = ['ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY', 'BUKIDNON', 'CAMIGUIN', 'LANAO DEL NORTE', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO ORIENTAL', 'COMPOSTELA VALLEY', 'DAVAO OCCIDENTAL', 'NORTH COTABATO', 'SOUTH COTABATO', 'SULTAN KUDARAT', 'SARANGANI', 'AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR', 'DINAGAT ISLANDS', 'BASILAN', 'LANAO DEL SUR', 'MAGUINDANAO', 'SULU', 'TAWI-TAWI'];

	return mindanaoProvinces.includes(province.toUpperCase());
}
